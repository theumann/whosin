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
- **Tailwind CSS v4** for styling, **lucide-react** for icons
- **Vitest** for unit tests
- Hosting: Railway (planned)

## Architecture

Layered so logic stays testable and the native-app door stays open (a future
native client could call the same API). Keep a clean boundary — **don't** bury
business logic in server-rendered pages.

```
src/
  app/          routes: pages (UI) + route handlers + thin server actions
  components/   reusable UI (PlayerForm, EventForm, WhatsAppComposer, BottomNav, ...)
  server/       backend: coach/group resolution + domain services
    services/   the real logic (roster.ts, events.ts)
  lib/          shared, pure: db client, messages.ts, status.ts, squad.ts, ui.ts
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

## Going live

Everything below is what stands between the current local-only app and real
users at **whosin.team**. Ordered roughly by priority. 🔴 = blocker (no one can
use it without this), 🟡 = needed for a credible launch, ⚪ = nice-to-have.

### 1. Hosting (Railway) 🔴

- [ ] **Create a separate personal Railway account** (use a personal email; keep
      it distinct from the partner's account on the other project). Free/Hobby
      tier is fine to start; upgrade when usage warrants.
- [ ] **One Railway project, two services:** the Next.js app + a Postgres
      database. Railway can host both — no need for a separate DB host. (Hosting
      the app on Railway too keeps everything in one place and matches existing
      experience; Vercel + a separate DB is the main alternative but adds moving
      parts.)
- [ ] **Connect the GitHub repo** to the app service so Railway builds on push
      (`npm run build` → `npm start`). Set the start command if needed.
- [ ] Confirm the app runs as a long-lived Node server (it does) — Prisma
      connection pooling is fine, no serverless adapter needed.

### 2. Production database 🔴

- [ ] Provision **Railway Postgres**; copy its `DATABASE_URL` into the app
      service's env (Railway can inject it automatically).
- [ ] **Decide on migrations:** locally we use `prisma db push` (no migration
      files). Before launch, generate a baseline migration and use
      `prisma migrate deploy` in production so schema changes are tracked and
      repeatable. (Acceptable shortcut for the very first deploy: `db push`
      against the prod DB — but switch to migrations soon.)
- [ ] **Do NOT run the demo seed against production.** It's destructive and
      creates fake players. The real coach signs in and builds their own group.
      Consider guarding `prisma/seed.mjs` to refuse a non-local `DATABASE_URL`.
- [ ] **Enable database backups** in Railway.

### 3. Auth + real email 🔴 (the big one)

Right now magic-link login **prints the link to the server console** — fine for
dev, but in production nobody can log in until real email works.

- [ ] **Sign up for an email sender** (Resend is the common choice with Auth.js).
- [ ] **Verify whosin.team** with the sender — add the **SPF, DKIM, DMARC** DNS
      records at the domain registrar so login emails don't land in spam.
- [ ] **Replace the console `sendVerificationRequest`** in `src/auth.ts` with the
      real transport (Resend API / SMTP), configured via env (`EMAIL_FROM`, API
      key). Keep the console fallback for local dev.
- [ ] **Generate a fresh production `AUTH_SECRET`** (do not reuse the dev one).
- [ ] Set **`AUTH_URL=https://whosin.team`** in production env.
- [ ] After deploy, confirm the production session cookie works over HTTPS
      (Auth.js uses the `__Secure-` cookie prefix on HTTPS automatically).

### 4. Domain + DNS (whosin.team) 🔴

- [ ] **Add whosin.team as a custom domain** on the Railway app service; set the
      **CNAME/A records** it gives you at your domain registrar.
- [ ] Railway auto-provisions an **HTTPS certificate** (Let's Encrypt) for the
      custom domain — verify it's active.
- [ ] Add the **email DNS records** from step 3 (SPF/DKIM/DMARC) at the same
      registrar.

### 5. Production env vars 🔴

Set these on the Railway app service (mirror of `.env.example`):

- [ ] `DATABASE_URL` (prod Postgres)
- [ ] `AUTH_SECRET` (fresh, strong)
- [ ] `AUTH_URL=https://whosin.team`
- [ ] `EMAIL_FROM` + the email provider's API key/SMTP creds

### 6. Branding + PWA assets 🟡

- [ ] **Rename the app from "my-team" to the brand** (WhosIn / whosin.team):
      update `metadata.title`, the home page heading, and
      `public/manifest.webmanifest` (`name`, `short_name`, `theme_color`).
- [ ] **Create a logo + app icons.** The manifest references
      `public/icon-192.png` and `public/icon-512.png` which **don't exist yet**;
      also add a `favicon` and an `apple-touch-icon`. (Tools for the logo:
      **Recraft** or **Midjourney** for the mark — Recraft can export clean SVG;
      **Looka**/**Canva** for a quick wordmark; or just a typographic wordmark in
      a nice font. Generate the icon sizes with a favicon generator like
      realfavicongenerator.net.)
- [ ] Verify **"Add to Home Screen"** shows the logo + name correctly on a phone.

### 7. Mobile testing 🟡

The primary user is a phone-first coach — test on a **real phone**, not just the
laptop:

- [ ] Layout/responsiveness on a small screen (the new Tailwind UI).
- [ ] **The wa.me "Share to WhatsApp"** flow actually opens WhatsApp and
      pre-fills the message on a phone (the key feature).
- [ ] The native **date/time picker** behaves on mobile.
- [ ] Magic-link login on the phone (tap link in email → lands authenticated).
- [ ] Tip: test against the deployed URL, or expose local over your network with
      a tunnel (e.g. `ngrok`) — public-wifi note: a tunnel avoids same-network
      issues.

### 8. Things easy to forget ⚪🟡

- [ ] **Privacy policy / basic terms** 🟡 — the app stores real people's names
      and phone numbers (PII). A short privacy note covering what's stored and
      how to request deletion is worth having, even pre-revenue.
- [ ] **Error & not-found pages** ⚪ — a friendly `error.tsx` / `not-found.tsx`
      instead of the default.
- [ ] **Rate-limit the magic-link request** ⚪ — prevent someone spamming login
      emails for an address.
- [ ] **CI on PRs** ⚪ — a GitHub Actions workflow running lint + unit tests (and
      optionally E2E with a Postgres service) before merge. Worth adding once
      others touch the repo.
- [ ] **Error monitoring / uptime** ⚪ — e.g. Sentry + a simple uptime check.
- [ ] **Pre-launch smoke test on production** 🔴 — sign in with a real email,
      create a group, add the roster, create an event, and share to WhatsApp
      from a phone. This is the real go/no-go.
