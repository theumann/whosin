# my-team

An app for managing sports teams and sports groups, with the potential to expand to all kinds of activity groups in the future.

## Status

Early-stage / not yet implemented. The project directory is empty; tech stack, architecture, and scope are still to be defined.

## Domain

- **Initial scope:** sports teams and sports groups (rosters, schedules, members, communication, etc. — to be specified).
- **Future scope:** generalize to any activity group (hobby clubs, study groups, community groups, etc.).
- Design decisions should keep the generalization path in mind: prefer abstractions that work for "a group of people doing an activity together" over hard-coding sports-specific concepts where it would block future reuse.

## Early users

Three real users lined up to test the app, spanning the structure spectrum from least to most structured:

| User               | Shape                                 | Confirmation           | Schedule                           |
| ------------------ | ------------------------------------- | ---------------------- | ---------------------------------- |
| Pick-up group #2   | Open event, capacity-capped, waitlist | Player taps "I'm in"   | Single game                        |
| Pick-up group #1   | Open event, capacity-capped, waitlist | Coach marks Venmo paid | Single game                        |
| Adult amateur team | Fixed roster                          | Yes / No / Maybe RSVP  | Recurring practice + game calendar |

The two pick-up groups will likely be the first users; the team is queued behind them.

**Key abstraction this lineup reveals:** payment is one _type_ of confirmation, not a prerequisite of the open-event flow. The core primitive is "a confirmation takes a slot." A confirmation can be a player tap, a coach-marked Venmo payment, or (later) something else. This decouples payment tracking from the open-event MVP — payment becomes an additive layer, not a blocker.

**Build sequence:**

1. Open event with player-tap confirmation → unlocks pick-up #2.
2. Mark-as-paid layer for coach on open events → unlocks pick-up #1.
3. Roster event with Yes / No / Maybe RSVPs + recurring events → unlocks team practice.
4. Game calendar (separate from practice) → completes team workflow.

Resist building team features in parallel "because we know they're coming" — let pick-up users push on the open-event flow first; team features get cleaner once that's been stress-tested.

## Design decisions

### WhatsApp coexists; the app does not bridge it

Real WhatsApp group integration is not on the table. Meta's official APIs (Cloud API, Business API) deliberately do **not** expose group chats. Unofficial libraries (`whatsapp-web.js`, `Baileys`) and managed services (Whapi.Cloud, GreenAPI, Wassenger) reverse-engineer the protocol but violate WhatsApp's ToS, risk getting the connected number banned, are fragile against Meta's updates, and are a non-starter for a paid product.

Instead, the model is **coexistence**:

- **The app owns structured state** WhatsApp is bad at: rosters, RSVPs, payment tracking, event capacity/waitlists, schedules.
- **WhatsApp stays the comms layer**: chat, banter, photos, casual updates. We do not try to replace it.
- **Crossing the gap is one tap.** Coach broadcasts from the app via a "Share to WhatsApp" button that uses `https://wa.me/?text=...` deep links — the app composes the message, WhatsApp handles the actual send. ToS-compliant, free, nothing to maintain.
- **A public game-status URL** is the canonical source of truth players see. Coach drops it once in the WhatsApp group; players tap to view the live roster without needing an account.

The mental model: the app is what WhatsApp would be if WhatsApp could do rosters and payments. Do the 5% WhatsApp handles poorly; leave the 95% where it already works.

### Keep the native-app door open — don't build deeply server-rendered pages

We're starting as a web-first PWA (Next.js). A PWA can later be wrapped in a native shell (e.g. Capacitor) or backed by a true native client **with little to no rewrite** — _as long as we keep a clean API boundary_. The one thing that would lock us into web-only is tangling all logic into deeply server-rendered HTML that assumes the server is always one hop away.

**Rule:** keep the data layer behind a clean API (route handlers / server actions that a future native client could also call). Do **not** build deeply server-rendered pages that bury business logic in page rendering. This costs nothing now and preserves the native path (PWA-forever, Capacitor wrap, or native client) for later.

## Stack (committed)

- **Frontend:** TypeScript + Next.js (App Router), as a PWA (`manifest.json`, add-to-home-screen).
- **Styling:** Tailwind CSS v4. Light theme (mobile-first usage), Inter font, `lucide-react` for icons. Shared button/field class strings live in `src/lib/ui.ts` rather than a component library.
- **Database:** Postgres via Prisma.
- **Auth:** magic-link email; coach-only in v1. Player opt-in (phase 2) is a public tokenized URL, not auth.
- **Hosting:** Railway (app + Postgres in one project).
- **Roles:** model `User` ⟷ `Group` via a `Membership` carrying a `role` from day one. v1 creates one owner membership; second/third coach is additive later — no migration.

## Conventions

### Create/add forms → modals

New-record forms (create event, add player) live in client-component modals, not inline on the page. The pattern:

- A `"use client"` modal component holds open/close state and a `useActionState` hook.
- The corresponding server action returns `{ error: string } | { ok: true; ... } | null` instead of redirecting, so errors display inline without closing the modal.
- On success the modal closes and calls `router.refresh()` (or `router.push()` for a new-record detail page).
- A FAB (`fixed bottom-20 right-4`) mirrors the above-list button on mobile.

### Destructive actions → confirmation modals

Delete buttons open a small centered confirmation modal before submitting. Client component holds open/close state; the actual delete is a plain form action inside the modal.

### Event date formatting

`src/lib/dateFormat.ts` exports `formatEventDate(date, currentYear)` — omits the year when it matches `currentYear`, includes it otherwise. Use this everywhere events are listed.

## Notes for Claude

- The user will elaborate on requirements in follow-up prompts — do not assume a stack, framework, or feature set yet.
- When in doubt about scope or modeling choices, ask before implementing.
