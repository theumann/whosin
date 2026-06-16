import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Resolves the signed-in coach's group, creating one on first login so the
// roster works immediately. Redirects to /login when not authenticated.
// Replaces the old dev stub now that real auth exists.
export async function getCurrentGroupId(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");

  const membership = await db.membership.findFirst({
    where: { user: { email } },
    select: { groupId: true },
  });
  if (membership) return membership.groupId;

  // First login: the adapter already created the User. Give them a group.
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const group = await db.group.create({
    data: {
      name: user.name ? `${user.name}'s Team` : "My Team",
      memberships: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  return group.id;
}
