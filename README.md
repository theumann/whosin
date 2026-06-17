# my-team

An app for managing sports teams and groups. The coach owns structured state
WhatsApp is bad at — rosters, RSVPs, event capacity/waitlists, payment tracking —
and broadcasts to the group's existing WhatsApp chat with one tap. See
[`CLAUDE.md`](./CLAUDE.md) for the product vision and design decisions, and
[`BRAINSTORM.md`](./BRAINSTORM.md) for how we got here.

## Stack

- **Next.js** (App Router) + TypeScript, as a PWA
- **Postgres** via **Prisma**
- **Auth.js (NextAuth v5)** — magic-link email (logged to console in dev)
- **Vitest** for unit tests
- Hosting: Railway (planned)

## Architecture

Layered so logic stays testable and the native-app door stays open (a future
native client could call the same API). Keep a clean boundary — **don't** bury
business logic in server-rendered pages.

```
src/
  app/          routes: pages (UI) + route handlers + thin server actions
  components/   reusable UI (PlayerForm, EventForm, WhatsAppComposer, ...)
  server/       backend: coach/group resolution + domain services
    services/   the real logic (roster.ts, events.ts)
  lib/          shared, pure: db client, messages.ts, status.ts
```

The rule: route handlers / server actions stay thin and delegate to
`server/services`; pure formatting/validation lives in `lib`.

## Getting started

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL + AUTH_SECRET
npm run db:push               # sync schema to your local Postgres
npm run db:seed               # demo coach + 12-player roster
npm run dev                   # http://localhost:3000
```

Log in: enter your email, then copy the **magic link printed in the terminal**
(dev doesn't send real email yet).

### Useful scripts

| Script                  | What it does                                                          |
| ----------------------- | --------------------------------------------------------------------- |
| `npm run dev`           | Start the dev server                                                  |
| `npm run build`         | Production build                                                      |
| `npm run db:push`       | Sync Prisma schema to the DB (no migration files)                     |
| `npm run db:seed`       | Reset to a known demo roster (**destructive** — wipes event statuses) |
| `npm run db:studio`     | Prisma Studio                                                         |
| `npm run lint`          | ESLint — code quality                                                 |
| `npm run format`        | Prettier — auto-format all files                                      |
| `npm run format:check`  | Prettier — check formatting without writing                           |
| `npm test`              | Run the unit test suite once                                          |
| `npm run test:watch`    | Run unit tests in watch mode                                          |
| `npm run test:coverage` | Run unit tests + print a coverage report (HTML in `coverage/`)        |
| `npm run test:e2e`      | Run Playwright end-to-end tests (auto-starts the dev server)          |

## Code style

**ESLint** (code quality) and **Prettier** (formatting) are complementary, not
overlapping: ESLint catches bugs and bad patterns (unused vars, `<a>` for
internal links, hook deps), Prettier owns layout (indentation, quotes, width).
`eslint-config-prettier` disables ESLint's formatting rules so the two never
fight. Run `npm run format` before committing; `npm run lint` enforces quality.

## Testing strategy

Our layered design concentrates the valuable logic in pure, easily-tested
places. We invest where bugs actually live, in order of value-per-effort:

| Layer                                                                       | Test type                                      | Status                   |
| --------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------ |
| `lib/` pure functions (message formatting, status labels, validation)       | **Unit** (Vitest) — no DB, no browser          | ✅ in place              |
| `server/services` (createEvent seeding, ensureEntries, status/squad writes) | **Integration** (Vitest + a test Postgres)     | ⏳ planned               |
| Client components (`WhatsAppComposer`, `DateTimeInput`)                     | **Component** (Vitest + React Testing Library) | ⏳ later                 |
| Full flows (create event → mark In → share)                                 | **E2E** (Playwright)                           | ✅ in place (happy path) |

### Principles

- **Pure logic first.** `lib/messages.ts` builds what gets broadcast to real
  people; it's critical _and_ trivial to test (no mocking). Most real bugs so
  far have been in formatting/state, not infrastructure.
- **Deterministic dates.** `vitest.setup.ts` pins `TZ=UTC` so date formatting in
  tests is stable across machines/CI.
- **E2E for the spine, not everything.** One green end-to-end happy path is worth
  more than many shallow tests — it proves the app actually works.
- **Defer service-integration tests until the schema settles**, to avoid
  rewriting them as the data model evolves (recurring events, etc.).

### Coverage

We rely on **automated coverage** rather than a hand-maintained tally (which
drifts). `npm run test:coverage` prints a per-file table and writes an HTML
report to `coverage/` (gitignored). Today `src/lib` is well covered and the
other layers read as gaps — accurate, since their tests are still planned.
Infra glue (`lib/db.ts`, layouts, route handlers) is excluded so the numbers
reflect real logic. Per-directory thresholds can be added in
`vitest.config.ts` once the suite stabilizes.

### End-to-end (Playwright)

E2E specs live in `e2e/`. `npm run test:e2e` auto-starts the dev server and runs
against it, so a local Postgres with a synced schema is required. A global setup
(`e2e/global-setup.ts`) provisions an **isolated** E2E coach + group + roster
(separate from dev/seed data, reset each run) and injects a DB-backed session via
`storageState`, so tests start authenticated without driving the magic-link UI
(that flow is better tested in its own targeted spec later). Reports land in
`playwright-report/` (gitignored).

### Writing tests

Co-locate unit tests as `*.test.ts` next to the code (`src/lib/messages.test.ts`);
put E2E specs in `e2e/*.spec.ts`. Run:

```bash
npm test               # unit, once
npm run test:watch     # unit, watch mode
npm run test:coverage  # unit + coverage report
npm run test:e2e       # end-to-end (starts the dev server)
```
