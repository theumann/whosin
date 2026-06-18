import type { EntryStatus, Squad } from "@prisma/client";
import { db } from "@/lib/db";
import { occurrenceDates } from "@/lib/recurrence";

// Event domain logic. Creating an event seeds one EventEntry per roster player
// (injured players default to Injury Reserve, everyone else to Pending Answer).
// ensureEntries keeps an event in sync when players are added to the roster
// after the event was created.

export type EventInput = {
  startsAt: Date;
  location?: string | null;
  capacity?: number | null;
  notes?: string | null;
};

export function validateEventInput(input: EventInput): string[] {
  const errors: string[] = [];
  if (!(input.startsAt instanceof Date) || isNaN(input.startsAt.getTime())) {
    errors.push("A valid date & time is required.");
  }
  if (input.capacity != null && (!Number.isInteger(input.capacity) || input.capacity < 1)) {
    errors.push("Capacity must be a whole number of 1 or more.");
  }
  return errors;
}

export function listEvents(groupId: string) {
  return db.event.findMany({
    where: { groupId },
    orderBy: { startsAt: "asc" },
    include: { entries: { select: { status: true } } },
  });
}

// Next N events from now, for the Home page preview. Excludes canceled
// events — a canceled game isn't useful to surface as "what's coming up".
export function listUpcomingEvents(groupId: string, limit: number) {
  return db.event.findMany({
    where: { groupId, startsAt: { gte: new Date() }, canceledAt: null },
    orderBy: { startsAt: "asc" },
    take: limit,
    include: { entries: { select: { status: true } } },
  });
}

export async function createEvent(groupId: string, input: EventInput) {
  const event = await db.event.create({
    data: {
      groupId,
      startsAt: input.startsAt,
      location: clean(input.location),
      capacity: input.capacity ?? null,
      notes: clean(input.notes),
    },
  });
  await ensureEntries(event.id);
  return event;
}

export function updateEvent(id: string, input: EventInput) {
  return db.event.update({
    where: { id },
    data: {
      startsAt: input.startsAt,
      location: clean(input.location),
      capacity: input.capacity ?? null,
      notes: clean(input.notes),
    },
  });
}

export function deleteEvent(id: string) {
  return db.event.delete({ where: { id } });
}

export type SeriesInput = {
  firstStartsAt: Date;
  endDate: Date;
  intervalWeeks: number;
  location?: string | null;
  capacity?: number | null;
  notes?: string | null;
};

export function validateSeriesInput(input: SeriesInput): string[] {
  const errors: string[] = [];
  if (!(input.firstStartsAt instanceof Date) || isNaN(input.firstStartsAt.getTime())) {
    errors.push("A valid first date & time is required.");
  }
  if (!(input.endDate instanceof Date) || isNaN(input.endDate.getTime())) {
    errors.push("A valid end date is required.");
  }
  if (
    input.firstStartsAt instanceof Date &&
    input.endDate instanceof Date &&
    !isNaN(input.firstStartsAt.getTime()) &&
    !isNaN(input.endDate.getTime()) &&
    input.endDate.getTime() < input.firstStartsAt.getTime()
  ) {
    errors.push("The end date must be on or after the first occurrence.");
  }
  if (!Number.isInteger(input.intervalWeeks) || input.intervalWeeks < 1) {
    errors.push("Repeat interval must be a whole number of weeks (1 or more).");
  }
  if (input.capacity != null && (!Number.isInteger(input.capacity) || input.capacity < 1)) {
    errors.push("Capacity must be a whole number of 1 or more.");
  }
  return errors;
}

// Create a recurring series and materialize its occurrences as Event rows,
// seeding entries for every roster player on each. Returns the series + count.
export async function createSeries(groupId: string, input: SeriesInput) {
  const dates = occurrenceDates(input.firstStartsAt, input.endDate, input.intervalWeeks);
  const location = clean(input.location);
  const capacity = input.capacity ?? null;
  const notes = clean(input.notes);

  const series = await db.eventSeries.create({
    data: {
      groupId,
      firstStartsAt: input.firstStartsAt,
      endDate: input.endDate,
      intervalWeeks: input.intervalWeeks,
      location,
      capacity,
      notes,
    },
  });

  await db.event.createMany({
    data: dates.map((startsAt) => ({
      groupId,
      seriesId: series.id,
      startsAt,
      location,
      capacity,
      notes,
    })),
  });

  // Seed entries for all occurrences in one pass.
  const [events, players] = await Promise.all([
    db.event.findMany({ where: { seriesId: series.id }, select: { id: true } }),
    db.player.findMany({ where: { groupId }, select: { id: true, injured: true } }),
  ]);
  const entries = events.flatMap((e) =>
    players.map((p) => ({
      eventId: e.id,
      playerId: p.id,
      status: (p.injured ? "INJURY" : "DEFAULT") as EntryStatus,
    })),
  );
  if (entries.length) await db.eventEntry.createMany({ data: entries });

  return { series, count: events.length };
}

// Delete a series and its FUTURE occurrences. Past events are kept as history
// (the FK is SetNull, so they simply detach from the deleted series).
export async function deleteSeries(seriesId: string) {
  await db.event.deleteMany({
    where: { seriesId, startsAt: { gte: new Date() } },
  });
  await db.eventSeries.delete({ where: { id: seriesId } });
}

export function setEventCanceled(id: string, canceled: boolean) {
  return db.event.update({
    where: { id },
    data: { canceledAt: canceled ? new Date() : null },
  });
}

export function setEntryStatus(eventId: string, playerId: string, status: EntryStatus) {
  return db.eventEntry.update({
    where: { eventId_playerId: { eventId, playerId } },
    data: { status },
  });
}

// Manual A/B squad assignment for an in-event player. null clears it.
export function setSquad(eventId: string, playerId: string, squad: Squad | null) {
  return db.eventEntry.update({
    where: { eventId_playerId: { eventId, playerId } },
    data: { squad },
  });
}

// Create DEFAULT (or INJURY, for injured players) entries for any roster player
// who doesn't yet have one on this event. Safe to call repeatedly.
export async function ensureEntries(eventId: string) {
  const event = await db.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { entries: { select: { playerId: true } } },
  });
  const players = await db.player.findMany({ where: { groupId: event.groupId } });
  const existing = new Set(event.entries.map((e) => e.playerId));
  const missing = players.filter((p) => !existing.has(p.id));
  if (missing.length) {
    await db.eventEntry.createMany({
      data: missing.map((p) => ({
        eventId,
        playerId: p.id,
        status: (p.injured ? "INJURY" : "DEFAULT") as EntryStatus,
      })),
    });
  }
}

// Full event with its roster, entries synced to the current roster, ordered for
// the status screen.
export async function getEventWithRoster(eventId: string) {
  await ensureEntries(eventId);
  return db.event.findUnique({
    where: { id: eventId },
    include: {
      group: { select: { name: true } },
      entries: {
        include: { player: true },
        orderBy: [{ player: { firstName: "asc" } }, { player: { lastName: "asc" } }],
      },
    },
  });
}

export function getEvent(id: string) {
  return db.event.findUnique({ where: { id } });
}

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
