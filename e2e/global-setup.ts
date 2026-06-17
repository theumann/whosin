import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import "dotenv/config";

// Prepares an isolated, deterministic world for E2E:
//  - an E2E-only coach + group (separate from dev/seed data)
//  - a clean 3-player roster, no events
//  - a real DB-backed session, written to storageState so tests start logged in
// We inject the session directly rather than driving the magic-link UI — that
// flow is stable to test separately; here we want a fast, reliable auth seam.
const COACH_EMAIL = "e2e-coach@example.com";
const AUTH_FILE = "./e2e/.auth/state.json";
const PLAYERS = [
  { firstName: "Alpha", phone: "+15550200" },
  { firstName: "Bravo", phone: "+15550201" },
  { firstName: "Charlie", phone: "+15550202" },
];

export default async function globalSetup() {
  const db = new PrismaClient();
  try {
    const user = await db.user.upsert({
      where: { email: COACH_EMAIL },
      update: { emailVerified: new Date() },
      create: { email: COACH_EMAIL, name: "E2E Coach", emailVerified: new Date() },
    });

    let membership = await db.membership.findFirst({ where: { userId: user.id } });
    if (!membership) {
      await db.group.create({
        data: {
          name: "E2E Test Team",
          memberships: { create: { userId: user.id, role: "OWNER" } },
        },
      });
      membership = await db.membership.findFirstOrThrow({ where: { userId: user.id } });
    }
    const groupId = membership.groupId;

    // Clean slate each run.
    await db.event.deleteMany({ where: { groupId } });
    await db.player.deleteMany({ where: { groupId } });
    await db.player.createMany({ data: PLAYERS.map((p) => ({ ...p, groupId })) });

    // Create a DB session and persist the auth cookie for Playwright.
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.session.create({ data: { sessionToken, userId: user.id, expires } });

    const state = {
      cookies: [
        {
          name: "authjs.session-token",
          value: sessionToken,
          domain: "localhost",
          path: "/",
          expires: Math.floor(expires.getTime() / 1000),
          httpOnly: true,
          secure: false,
          sameSite: "Lax" as const,
        },
      ],
      origins: [],
    };
    mkdirSync(dirname(AUTH_FILE), { recursive: true });
    writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
  } finally {
    await db.$disconnect();
  }
}
