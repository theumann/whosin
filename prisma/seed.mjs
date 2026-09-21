import { PrismaClient } from "@prisma/client";

// Destructive: wipes and replaces the roster. Refuse to run against anything
// but localhost unless explicitly overridden, so a stray `npm run db:seed`
// can't wipe a real coach's roster on staging/production.
const dbHost = new URL(process.env.DATABASE_URL).hostname;
const isLocal = dbHost === "localhost" || dbHost === "127.0.0.1";
if (!isLocal && process.env.ALLOW_REMOTE_SEED !== "true") {
  console.error(
    `Refusing to seed non-local database (host: ${dbHost}). ` +
      `Set ALLOW_REMOTE_SEED=true to override.`,
  );
  process.exit(1);
}

const db = new PrismaClient();

// Re-runnable seed: resets the demo coach's roster to a known state.
// Set SEED_COACH_EMAIL to the address you sign in with locally — the default
// is a placeholder, so seeding without it gives you data you can't log in as.
const COACH_EMAIL = process.env.SEED_COACH_EMAIL ?? "coach@example.com";
const COACH_NAME = "Thierry";
const GROUP_NAME = "Thursday Night Soccer";

const PLAYERS = [
  { firstName: "Marco", lastName: "Rossi", phone: "+15550100", skillBucket: "A", notes: "Captain" },
  { firstName: "James", lastName: "Okafor", phone: "+15550101", skillBucket: "A" },
  {
    firstName: "Diego",
    lastName: "Hernandez",
    phone: "+15550102",
    skillBucket: "A",
    email: "diego@example.com",
  },
  { firstName: "Liam", lastName: "Murphy", phone: "+15550103", skillBucket: "B" },
  { firstName: "Noah", lastName: "Andersson", phone: "+15550104", skillBucket: "B" },
  { firstName: "Yuki", lastName: "Tanaka", phone: "+15550105", skillBucket: "B" },
  {
    firstName: "Sam",
    lastName: "Cohen",
    phone: "+15550106",
    skillBucket: "B",
    injured: true,
    notes: "Ankle - out a few weeks",
  },
  { firstName: "Omar", lastName: "Haddad", phone: "+15550107", skillBucket: "C" },
  { firstName: "Tom", lastName: "Becker", phone: "+15550108", skillBucket: "C" },
  {
    firstName: "Raj",
    lastName: "Patel",
    phone: "+15550109",
    skillBucket: "C",
    email: "raj@example.com",
  },
  {
    firstName: "Kevin",
    lastName: "Nguyen",
    phone: "+15550110",
    skillBucket: "C",
    injured: true,
    notes: "Knee",
  },
  { firstName: "Andre", lastName: "Silva", phone: "+15550111", skillBucket: "A" },
];

async function main() {
  // Coach: upsert + mark email verified so magic-link login works immediately.
  const coach = await db.user.upsert({
    where: { email: COACH_EMAIL },
    update: { name: COACH_NAME, emailVerified: new Date() },
    create: { email: COACH_EMAIL, name: COACH_NAME, emailVerified: new Date() },
  });

  // Group: reuse the coach's existing group if there is one, else create it.
  let membership = await db.membership.findFirst({
    where: { userId: coach.id },
    include: { group: true },
  });
  if (!membership) {
    const group = await db.group.create({
      data: {
        name: GROUP_NAME,
        memberships: { create: { userId: coach.id, role: "OWNER" } },
      },
    });
    membership = { groupId: group.id, group };
  }
  const groupId = membership.groupId;

  // Reset roster to a known state, then create the demo players.
  await db.player.deleteMany({ where: { groupId } });
  await db.player.createMany({
    data: PLAYERS.map((p) => ({ ...p, groupId })),
  });

  const count = await db.player.count({ where: { groupId } });
  console.log(
    `Seeded coach ${COACH_EMAIL} + group "${membership.group.name}" with ${count} players.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
