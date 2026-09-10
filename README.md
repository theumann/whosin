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
npm run db:migrate            # apply migrations to your local Postgres
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
| `npm run db:migrate`    | Create + apply a migration from schema changes (local dev)            |
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

| Layer                                                                       | Test type                                      | Status      |
| --------------------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| `lib/` pure functions (message formatting, status labels, validation)       | **Unit** (Vitest) — no DB, no browser          | ✅ in place |
| `server/services` (createEvent seeding, ensureEntries, status/squad writes) | **Integration** (Vitest + a test Postgres)     | ⏳ planned  |
| Client components (`WhatsAppComposer`, `DateTimeInput`)                     | **Component** (Vitest + React Testing Library) | ⏳ later    |
| Full flows (create event → mark In → share)                                 | **E2E** (Playwright)                           | ✅ in place |
| Auth (redirect unauthenticated, login, session)                             | **E2E** (Playwright)                           | ✅ in place |
| Roster page (add player modal, delete confirmation)                         | **E2E** (Playwright)                           | ✅ in place |
| Events page (tabs, pagination, create modal, FAB)                           | **E2E** (Playwright)                           | ✅ in place |
| Navigation (logo links, pencil icon hrefs)                                  | **E2E** (Playwright)                           | ✅ in place |

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

### 1. Hosting (Railway) 🔴 ✅ Done

- [x] **Add whosin as its own project** in the existing Railway account (a new
      account isn't needed — Railway is one account → many projects). For a clean
      ownership/billing boundary from the partner's project, put it in its **own
      Workspace**. Free/Hobby tier is fine to start; upgrade when usage warrants.
- [x] **One Railway project, two services:** the Next.js app + a Postgres
      database. Railway can host both — no need for a separate DB host. (Hosting
      the app on Railway too keeps everything in one place and matches existing
      experience; Vercel + a separate DB is the main alternative but adds moving
      parts.)
- [x] **Connect the GitHub repo** to the app service so Railway builds on push
      (`npm run build` → `npm start`). Set the start command if needed.
- [x] Confirm the app runs as a long-lived Node server (it does) — Prisma
      connection pooling is fine, no serverless adapter needed.

> **Two projects in one Railway account** (whosin + the partner's project). Using
> one account is simpler than juggling two logins — the only risk is deploying to
> the wrong _project_, which is low-stakes and obvious (the project name is right
> there). GitHub and Claude don't enter into it.
>
> - **Separate Workspaces** keep ownership/billing clean between whosin and the
>   partner's project while sharing one login. Switch projects from the dropdown.
> - **GitHub doesn't pick the project** — the Railway dashboard you're in does.
>   Create the whosin service from the whosin project/workspace.
> - **Scope the Railway GitHub App to "Only select repositories" → just the
>   whosin repo** when authorizing, so a service can't accidentally pull the wrong
>   repo.
> - **Prefer the dashboard over the global `railway` CLI.** If you use the CLI or
>   CI, use a **project-scoped `RAILWAY_TOKEN`** (it can't touch any other
>   project) and run `railway status` / `railway whoami` before acting.
> - **Claude has no Railway connection** — it only touches Railway if you ask it
>   to run a `railway` CLI command, so dashboard-only work keeps it out entirely.

### 2. Production database 🔴 ✅ Done

- [x] Provision **Railway Postgres**; copy its `DATABASE_URL` into the app
      service's env (Railway can inject it automatically). Wired via Railway's
      variable reference (`${{Postgres.DATABASE_URL}}`), the internal URL.
- [x] **Decide on migrations:** took the documented shortcut — ran `prisma db
push` directly against the prod DB for the first deploy. **Now resolved:**
      generated a baseline migration
      (`prisma/migrations/20260619214557_baseline`) from a diff against an
      empty schema, then marked it **applied** (not re-run, since the schema
      already matched) on local, staging, and production via
      `prisma migrate resolve --applied 20260619214557_baseline`. `npm start`
      now runs `prisma migrate deploy` before `next start`, so future schema
      changes ship as committed migrations applied automatically on deploy.
      Local dev now uses `npm run db:migrate` (`prisma migrate dev`) instead
      of `db:push`.
- [x] **Do NOT run the demo seed against production.** It's destructive and
      creates fake players. The real coach signs in and builds their own group.
      `prisma/seed.mjs` now refuses to run against any non-local
      `DATABASE_URL` (checks the hostname, not a hardcoded URL) unless
      `ALLOW_REMOTE_SEED=true` is explicitly set — keeps the door open to
      seed staging on purpose, while blocking accidental runs against prod.
- [x] **Enable WAL archiving** on the Railway Postgres service (Postgres
      service → **Backups** tab → enable continuous archiving). Scheduled
      backups and point-in-time **restore** require the Pro plan (not
      available on Hobby), but archiving itself is free and runs regardless —
      enabled now so a restore is possible later if you ever upgrade.
- [x] **Staging environment, reachable from a phone.** Set up via Railway's
      **Duplicate Environment** on the `production` environment, which cloned
      the app + Postgres services into a new `staging` environment with the
      `DATABASE_URL` reference automatically rewired to the staging Postgres
      (confirmed it resolves to the staging DB, not prod). Then: generated a
      fresh `AUTH_SECRET`, generated a public domain
      (`whosin-staging.up.railway.app`) and set `AUTH_URL` to it, kept the
      same `RESEND_API_KEY` / `EMAIL_FROM` (same verified sending domain),
      and pushed the schema with `prisma db push` using the staging
      Postgres's **public** connection string (`DATABASE_URL_PUBLIC`-style
      URL — the internal `postgres.railway.internal` host only resolves
      inside Railway's network, not from a laptop). Verified end-to-end on a
      phone: page loads, magic-link login works. Local Postgres remains fine
      for everyday schema iteration; this environment covers the cases local
      can't (phone testing, rehearsing against a deployed build).
- [x] **Staging and production deploy from different branches.** Both
      environments originally watched `main` (an artifact of Duplicate
      Environment), so a single push deployed straight to production with no
      rehearsal step. Now: **staging watches `main`**, **production watches a
      dedicated `production` branch**, with **Wait for CI** enabled on the
      production service so a red build can't ship. The environments already
      had separate `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` values from
      the duplication, so only the deploy trigger changed.

      Shipping is therefore a git operation, which keeps the release history
      in the repo rather than in Railway's dashboard:

      ```bash
      # always start here: local refs go stale fast, and a stale main is
      # why a promote silently reports "Everything up-to-date"
      git checkout main && git pull

      # what is on main but not yet in production?
      git log --oneline origin/production..main

      # ship main to production (fast-forward)
      git push origin main:production

      # roll production back to a known-good commit
      git push -f origin <sha>:production
      ```

      There is deliberately **no local `production` branch** — it only exists
      on the remote, so it can't drift or be committed to by accident. Always
      refer to it as `origin/production`; plain `production` will fail with
      "unknown revision".

      ⚠️ **Rolling back reverts code, not data.** `npm start` runs
      `prisma migrate deploy`, and Prisma has no automatic down-migration. If
      a bad deploy applied a *destructive* migration (dropped a column,
      narrowed a type), force-pushing the old commit leaves production
      running old code against the new schema — frequently worse than the bug
      you're backing out. Rollback is only safe while migrations are additive.
      See the open item below.

### 3. Auth + real email 🔴 ✅ Done

Magic-link login now sends real email in production and has been confirmed
working end-to-end (email arrives, link signs in).

- [x] **Sign up for an email sender** — used Resend.
- [x] **Verify a sending domain** with Resend — used the subdomain
      `contact.whosin.team` (not the root domain) and added its SPF/DKIM/DMARC
      records at the registrar.
- [x] **Replace the console `sendVerificationRequest`** in `src/auth.ts` —
      ended up calling **Resend's HTTP API directly** (`fetch`), not SMTP:
      Railway blocks outbound SMTP ports, which surfaced as connection
      timeouts until the switch. Configured via `RESEND_API_KEY` + `EMAIL_FROM`.
      Console fallback still used for local dev (when `RESEND_API_KEY` is unset).
- [x] **Generate a fresh production `AUTH_SECRET`** (do not reuse the dev one).
- [x] Set **`AUTH_URL=https://whosin.team`** in production env.
- [x] After deploy, confirm the production session cookie works over HTTPS —
      confirmed via a real magic-link login on `whosin.team`.

### 4. Domain + DNS (whosin.team) 🔴 ✅ Done

- [x] **Add whosin.team as a custom domain** on the Railway app service; set the
      **CNAME/TXT records** it gave at the registrar (Namecheap). Watch for a
      conflicting default "URL Redirect Record" on `@` — it blocks the CNAME
      from resolving and needs to be deleted.
- [x] Railway auto-provisions an **HTTPS certificate** (Let's Encrypt) for the
      custom domain — verified active (`whosin.team` loads over HTTPS).
- [x] Add the **email DNS records** from step 3 (SPF/DKIM/DMARC) at the same
      registrar (under the `contact.` subdomain).

### 5. Production env vars 🔴 ✅ Done

Set on the Railway app service:

- [x] `DATABASE_URL` (prod Postgres, via variable reference)
- [x] `AUTH_SECRET` (fresh, strong)
- [x] `AUTH_URL=https://whosin.team`
- [x] `EMAIL_FROM` + `RESEND_API_KEY` (HTTP API key, not SMTP creds —
      `.env.example` reflects this)
- [ ] `ALLOWED_EMAILS` — comma-separated sign-in allowlist. **Required**: with
      it unset in production every sign-in is refused, by design. Sign-up is
      invite-only in v1, which also keeps `/login` from being an open email
      relay that strangers can use to burn the Resend quota and the sending
      domain's reputation.

### 6. Branding + PWA assets 🟡

- [x] **Rename the app from "my-team" to the brand** (whosIn / whosin.team):
      updated `metadata.title`, the home page heading, and
      `public/manifest.webmanifest` (`name`, `short_name`). `theme_color`
      still uses the placeholder slate — revisit once a brand color is
      picked alongside the logo.
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
- [ ] **The "Share to WhatsApp"** flow actually opens WhatsApp and pre-fills the
      message on a phone (the key feature) — check the emoji survive the handoff,
      not just the text. See the endpoint note in `src/lib/messages.ts`.
- [ ] The native **date/time picker** behaves on mobile.
- [ ] Magic-link login on the phone (tap link in email → lands authenticated).
- [ ] Tip: test against the deployed URL, or expose local over your network with
      a tunnel (e.g. `ngrok`) — public-wifi note: a tunnel avoids same-network
      issues.

### 8. Things easy to forget ⚪🟡

- [x] **Privacy policy / basic terms** 🟡 — added `/privacy` and `/terms`
      pages, linked from the sign-in page. Covers what's collected (coach
      email for magic-link auth; player name/phone/email/notes entered by the
      coach), that it's not sold/shared beyond the hosting (Railway) and email
      (Resend) providers, and that deletion requests go to
      `contact@whosin.team` and are handled manually for now. Terms include a
      no-affiliation-with-WhatsApp disclaimer per the coexistence model in
      `CLAUDE.md`. Not formal legal review — revisit with a lawyer before any
      paid tier.
- [x] **Error & not-found pages** ⚪ — added `src/app/error.tsx` (client
      error boundary with a "Try again" button) and `src/app/not-found.tsx`,
      matching the existing minimal page style.
- [x] **Rate-limit the magic-link request** ⚪ — `src/auth.ts` now enforces a
      60-second per-email cooldown in `sendVerificationRequest` (backed by
      `isRateLimited` in `src/lib/rateLimit.ts`, unit-tested) before sending
      another magic-link email. In-memory, so it resets on redeploy and only
      holds for a single instance — revisit with a shared store (e.g. Redis)
      if the app ever scales beyond one Railway instance.
- [x] **CI on PRs** ⚪ — added `.github/workflows/ci.yml`: runs format check,
      lint, typecheck, and unit tests on every PR into `main`. Deliberately
      skips E2E for now (needs a Postgres service + more setup) — fine while
      it's a single-developer repo; add it if/when others start contributing
      or E2E coverage grows.
- [x] **Error monitoring** ⚪ — wired `@sentry/nextjs`: `src/instrumentation.ts`
      (server/edge) + `src/instrumentation-client.ts` (browser), both reading
      `NEXT_PUBLIC_SENTRY_DSN` (not secret, so one var works for both sides).
      `src/app/error.tsx` and the new `src/app/global-error.tsx` (catches
      errors in the root layout itself) report via `Sentry.captureException`.
      `next.config.ts` wraps the config with `withSentryConfig` so production
      builds upload source maps (needs `SENTRY_AUTH_TOKEN`, scope
      `project:releases`, set on Railway) and strip them from the shipped
      client bundle. Set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` on
      the Railway staging + production app services to activate; both unset
      locally is fine (errors just won't report and the build skips source
      map upload in dev).
- [ ] **Migration safety / rollback guardrails** 🔴 — **do this next, or very
      soon.** Now that production deploys deliberately from the `production`
      branch, a bad release can be rolled back with
      `git push -f origin <sha>:production` — but that reverts _code only_.
      `npm start` runs `prisma migrate deploy` and Prisma has no automatic
      down-migration, so a destructive migration (dropped column, narrowed
      type, renamed field) survives the rollback and leaves old code running
      against a new schema. The deploy split we just made is what raises the
      stakes here: production can now lag staging by several commits, so a
      single promote may apply several migrations at once. Worth deciding:
      (a) an expand/contract convention so migrations are always additive and
      reversible within a release, (b) a review step that flags destructive
      SQL in `prisma/migrations` before promoting, and (c) whether the Hobby
      plan's lack of point-in-time restore is acceptable once real coaches
      have data in there — WAL archiving is on, but restore needs Pro. Get to
      this before the first column drop or rename, not after.
- [ ] **Uptime check** ⚪ — still open: a simple external ping (e.g.
      UptimeRobot's free tier) against `https://whosin.team` so you hear about
      an outage instead of a coach telling you.
- [ ] **Pre-launch smoke test on production** 🔴 — sign in with a real email,
      create a group, add the roster, create an event, and share to WhatsApp
      from a phone. This is the real go/no-go.
