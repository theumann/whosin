"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentGroupId } from "@/server/coach";
import {
  createPlayer,
  deletePlayer,
  updatePlayer,
  validatePlayerInput,
  type PlayerInput,
} from "@/server/services/roster";

// Thin server actions: parse the form, validate, delegate to the roster
// service. No business logic lives here.

function parse(formData: FormData): PlayerInput {
  return {
    firstName: String(formData.get("firstName") ?? ""),
    phone: str(formData.get("phone")),
    lastName: str(formData.get("lastName")),
    email: str(formData.get("email")),
    skillBucket: str(formData.get("skillBucket")),
    injured: formData.get("injured") === "on",
    notes: str(formData.get("notes")),
  };
}

function str(value: FormDataEntryValue | null): string | null {
  return value == null ? null : String(value);
}

export type AddPlayerResult = { error: string } | { ok: true } | null;

export async function addPlayerModalAction(
  _prev: AddPlayerResult,
  formData: FormData,
): Promise<AddPlayerResult> {
  const input = parse(formData);
  const errors = validatePlayerInput(input);
  if (errors.length) return { error: errors.join(" ") };
  const groupId = await getCurrentGroupId();
  await createPlayer(groupId, input);
  revalidatePath("/roster");
  return { ok: true };
}

export async function addPlayerAction(formData: FormData) {
  const input = parse(formData);
  const errors = validatePlayerInput(input);
  if (errors.length) {
    redirect(`/roster?error=${encodeURIComponent(errors.join(" "))}`);
  }
  const groupId = await getCurrentGroupId();
  await createPlayer(groupId, input);
  revalidatePath("/roster");
  redirect("/roster");
}

export async function updatePlayerAction(id: string, formData: FormData) {
  const input = parse(formData);
  const errors = validatePlayerInput(input);
  if (errors.length) {
    redirect(`/roster/${id}/edit?error=${encodeURIComponent(errors.join(" "))}`);
  }
  const groupId = await getCurrentGroupId();
  await updatePlayer(groupId, id, input);
  revalidatePath("/roster");
  redirect("/roster");
}

export async function deletePlayerAction(id: string) {
  const groupId = await getCurrentGroupId();
  await deletePlayer(groupId, id);
  revalidatePath("/roster");
}
