"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EntryStatus, Squad } from "@prisma/client";
import { getCurrentGroupId } from "@/server/coach";
import {
  createEvent,
  createSeries,
  deleteEvent,
  deleteSeries,
  setEntryStatus,
  setEventCanceled,
  setSquad,
  updateEvent,
  validateEventInput,
  validateSeriesInput,
  type EventInput,
  type SeriesInput,
} from "@/server/services/events";

// Thin server actions: parse the form, validate, delegate to the events service.

function parse(formData: FormData): EventInput {
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  return {
    startsAt: startsAtRaw ? new Date(startsAtRaw) : new Date(NaN),
    location: str(formData.get("location")),
    capacity: capacityRaw ? Number(capacityRaw) : null,
    notes: str(formData.get("notes")),
  };
}

function str(value: FormDataEntryValue | null): string | null {
  return value == null ? null : String(value);
}

function parseSeries(formData: FormData): SeriesInput {
  const firstRaw = String(formData.get("startsAt") ?? "");
  const endRaw = String(formData.get("endDate") ?? "");
  const intervalRaw = String(formData.get("intervalWeeks") ?? "1").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  return {
    firstStartsAt: firstRaw ? new Date(firstRaw) : new Date(NaN),
    // A date input ("YYYY-MM-DD") parses as UTC midnight by default; append a
    // local time so the end date is interpreted in the coach's local timezone
    // (matching how firstStartsAt is parsed). Otherwise the last occurrence can
    // be dropped in negative-offset timezones.
    endDate: endRaw ? new Date(`${endRaw}T00:00:00`) : new Date(NaN),
    intervalWeeks: intervalRaw ? Number(intervalRaw) : 1,
    location: str(formData.get("location")),
    capacity: capacityRaw ? Number(capacityRaw) : null,
    notes: str(formData.get("notes")),
  };
}

export async function addEventAction(formData: FormData) {
  const groupId = await getCurrentGroupId();

  // Recurring: create a whole series of occurrences.
  if (formData.get("recurring") === "on") {
    const input = parseSeries(formData);
    const errors = validateSeriesInput(input);
    if (errors.length) {
      redirect(`/events?error=${encodeURIComponent(errors.join(" "))}`);
    }
    await createSeries(groupId, input);
    revalidatePath("/events");
    redirect("/events");
  }

  // One-off event.
  const input = parse(formData);
  const errors = validateEventInput(input);
  if (errors.length) {
    redirect(`/events?error=${encodeURIComponent(errors.join(" "))}`);
  }
  const event = await createEvent(groupId, input);
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function deleteSeriesAction(seriesId: string) {
  await deleteSeries(seriesId);
  revalidatePath("/events");
  redirect("/events");
}

export async function updateEventAction(id: string, formData: FormData) {
  const input = parse(formData);
  const errors = validateEventInput(input);
  if (errors.length) {
    redirect(`/events/${id}/edit?error=${encodeURIComponent(errors.join(" "))}`);
  }
  await updateEvent(id, input);
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEventAction(id: string) {
  await deleteEvent(id);
  revalidatePath("/events");
  redirect("/events");
}

export async function setStatusAction(eventId: string, playerId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "") as EntryStatus;
  await setEntryStatus(eventId, playerId, status);
  revalidatePath(`/events/${eventId}`);
}

export async function setCanceledAction(eventId: string, canceled: boolean) {
  await setEventCanceled(eventId, canceled);
  revalidatePath(`/events/${eventId}`);
}

export async function setSquadAction(eventId: string, playerId: string, formData: FormData) {
  const raw = String(formData.get("squad") ?? "");
  const squad: Squad | null = raw === "A" || raw === "B" ? raw : null;
  await setSquad(eventId, playerId, squad);
  revalidatePath(`/events/${eventId}`);
}
