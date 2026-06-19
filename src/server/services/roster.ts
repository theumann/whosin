import { db } from "@/lib/db";

// Roster domain logic. Route handlers / server actions stay thin and call into
// here, keeping a clean API boundary (see CLAUDE.md). firstName + phone are the
// only required fields; everything else is optional.

export type PlayerInput = {
  firstName: string;
  phone: string;
  lastName?: string | null;
  email?: string | null;
  skillBucket?: string | null;
  injured?: boolean;
  notes?: string | null;
};

export function validatePlayerInput(input: PlayerInput): string[] {
  const errors: string[] = [];
  if (!input.firstName.trim()) errors.push("First name is required.");
  if (!input.phone.trim()) errors.push("Phone is required.");
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
    phone: input.phone.trim(),
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
