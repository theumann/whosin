# commit-and-push profile — whosin

Repo profile for the `commit-and-push` skill. Specifics only; the shared procedure lives in the skill.

## Platform

**npm** (not pnpm), on **Windows / PowerShell**.

## Review traps

Check these when the diff touches the relevant area:

- The **clean-API-boundary rule** — data access stays behind route handlers / server actions a future native client could call. Business logic buried in server-rendered pages is the one thing that locks us out of the native path.
- **Neutral domain naming** — the app generalises from sports teams to any activity group. Sports-specific concepts hard-coded where they would block that reuse are a defect, not a shortcut.
- **The WhatsApp-coexistence model** — the app owns structured state, WhatsApp stays the comms layer. Nothing tries to bridge or replace it.
- **WhatsApp links use `https://api.whatsapp.com/send?text=`**, never the shorter `wa.me` — as of Aug 2026 `wa.me` mangles multi-byte UTF-8 and turns every emoji into U+FFFD. See `src/lib/messages.ts`.

## Test coverage

Glob: `src/**/*.test.ts` (Vitest).

**Expected to be covered:** every new or modified file in `src/lib/` and `src/server/services/` — new service methods, new message/format branches, validation changes, schema changes affecting query results.

**Deliberately not unit-tested — do not flag:** `src/lib/db.ts`, layouts, route handlers, server components, and for now the `server/services` integration layer and client components. Those are covered by E2E or planned later; the README testing strategy is the source of truth.

## Docs

`CLAUDE.md` and `README.md` every time. `BRAINSTORM.md` only if scope or direction changed.

Watch for: new scripts, schema/model changes, stack or convention changes, testing-strategy status.

## Gates

In order:

1. `npm run format` — Prettier. Owns formatting; ESLint owns code quality.
2. `npm run lint` — ESLint. Try `npm run lint:fix` for auto-fixable errors, then re-run.
3. `npx tsc --noEmit` — typecheck.
4. `npm test` — Vitest, unit suite.
5. `npm run test:e2e` — **optional, ask first.** Only when the changes touch app flows (events, roster, auth, the WhatsApp composer, pages, or server actions). Requires a local Postgres with a synced schema and auto-starts the dev server, so it is slow (~30–60s). Skip for pure `lib/` or docs-only changes.

## After the push

Nothing. Stop after the push.
