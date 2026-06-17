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

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to the DB (no migration files) |
| `npm run db:seed` | Reset to a known demo roster (**destructive** — wipes event statuses) |
| `npm run db:studio` | Prisma Studio |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Testing strategy

Our layered design concentrates the valuable logic in pure, easily-tested
places. We invest where bugs actually live, in order of value-per-effort:

| Layer | Test type | Status |
|---|---|---|
| `lib/` pure functions (message formatting, status labels, validation) | **Unit** (Vitest) — no DB, no browser | ✅ in place |
| `server/services` (createEvent seeding, ensureEntries, status/squad writes) | **Integration** (Vitest + a test Postgres) | ⏳ planned |
| Client components (`WhatsAppComposer`, `DateTimeInput`) | **Component** (Vitest + React Testing Library) | ⏳ later |
| Full flows (login → create event → mark In → share) | **E2E** (Playwright) | ⏳ planned (before deploy) |

### Principles

- **Pure logic first.** `lib/messages.ts` builds what gets broadcast to real
  people; it's critical *and* trivial to test (no mocking). Most real bugs so
  far have been in formatting/state, not infrastructure.
- **Deterministic dates.** `vitest.setup.ts` pins `TZ=UTC` so date formatting in
  tests is stable across machines/CI.
- **E2E for the spine, not everything.** One green end-to-end happy path is worth
  more than many shallow tests — it proves the app actually works.
- **Defer service-integration tests until the schema settles**, to avoid
  rewriting them as the data model evolves (recurring events, etc.).

### Writing tests

Co-locate as `*.test.ts` next to the code (`src/lib/messages.test.ts`). Run:

```bash
npm test            # once
npm run test:watch  # watch mode while developing
```
