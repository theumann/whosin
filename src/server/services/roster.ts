import { db } from "@/lib/db";

// Roster domain logic. Route handlers / server actions stay thin and call into
// here, keeping a clean API boundary (see CLAUDE.md). firstName is the only
// required field; everything else, including phone, is optional — a player's
// phone number isn't needed today (broadcasts go to the group's existing
// WhatsApp chat, not individual numbers) and is PII for someone who hasn't
// opted in to the app.

export type PlayerInput = {
  firstName: string;
  phone?: string | null;
  lastName?: string | null;
  email?: string | null;
  skillBucket?: string | null;
  injured?: boolean;
  notes?: string | null;
};

export function validatePlayerInput(input: PlayerInput): string[] {
  const errors: string[] = [];
  if (!input.firstName.trim()) errors.push("First name is required.");
  return errors;
}

export function listPlayers(groupId: string) {
  return db.player.findMany({
    where: { groupId },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
}

export function getPlayer(groupId: string, id: string) {
  return db.player.findFirst({ where: { id, groupId } });
}

export function createPlayer(groupId: string, input: PlayerInput) {
  return db.player.create({ data: { groupId, ...normalize(input) } });
}

export function updatePlayer(groupId: string, id: string, input: PlayerInput) {
  return db.player.update({ where: { id, groupId }, data: normalize(input) });
}

export function deletePlayer(groupId: string, id: string) {
  return db.player.delete({ where: { id, groupId } });
}

function normalize(input: PlayerInput) {
  return {
    firstName: input.firstName.trim(),
    phone: clean(input.phone),
    lastName: clean(input.lastName),
    email: clean(input.email),
    skillBucket: clean(input.skillBucket),
    injured: input.injured ?? false,
    notes: clean(input.notes),
  };
}

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
