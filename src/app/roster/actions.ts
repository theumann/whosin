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
    phone: String(formData.get("phone") ?? ""),
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
  await updatePlayer(id, input);
  revalidatePath("/roster");
  redirect("/roster");
}

export async function deletePlayerAction(id: string) {
  await deletePlayer(id);
  revalidatePath("/roster");
}
