"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EntryStatus } from "@prisma/client";
import { getCurrentGroupId } from "@/server/coach";
import {
  createEvent,
  deleteEvent,
  setEntryStatus,
  setEventCanceled,
  updateEvent,
  validateEventInput,
  type EventInput,
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

export async function addEventAction(formData: FormData) {
  const input = parse(formData);
  const errors = validateEventInput(input);
  if (errors.length) {
    redirect(`/events?error=${encodeURIComponent(errors.join(" "))}`);
  }
  const groupId = await getCurrentGroupId();
  const event = await createEvent(groupId, input);
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
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
