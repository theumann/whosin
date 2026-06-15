import { db } from "@/lib/db";

// TEMPORARY single-coach stub until magic-link auth lands (next step).
// Finds-or-creates one coach + one group so the roster has a real group to
// attach to. Replace getCurrentGroupId() with the authed coach's group once
// auth exists — nothing else in the app should need to change.
const DEV_COACH_EMAIL = "dev-coach@example.com";
const DEV_GROUP_NAME = "My Team (dev)";

export async function getCurrentGroupId(): Promise<string> {
  const existing = await db.membership.findFirst({
    where: { user: { email: DEV_COACH_EMAIL } },
    select: { groupId: true },
  });
  if (existing) return existing.groupId;

  const user = await db.user.upsert({
    where: { email: DEV_COACH_EMAIL },
    update: {},
    create: { email: DEV_COACH_EMAIL, name: "Dev Coach" },
  });

  const group = await db.group.create({
    data: {
      name: DEV_GROUP_NAME,
      memberships: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  return group.id;
}
