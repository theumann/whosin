import type { EntryStatus } from "@prisma/client";
import { db } from "@/lib/db";

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
