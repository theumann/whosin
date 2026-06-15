# Brainstorm — my-team

Unfiltered first-instinct thoughts before hearing the user's ideas. Opinionated on purpose.

## The one problem I'd solve first

**"Who's actually showing up?"**

For amateur teams, the #1 weekly pain for a manager is figuring out attendance for the next training or match. WhatsApp polls and group chats fail at this constantly: replies get buried, half the team doesn't answer, the manager ends up DMing people the night before. Doodle and similar tools are too generic and too high-friction for a recurring weekly rhythm.

If the app does nothing else well, it should make this *trivially* easy — both for the manager (one screen, real numbers) and the player (one tap, no login friction).

Everything else (chat, payments, lineups, stats) is built on top of attendance. Attendance is the gravity well.

## What I'd build first (MVP — ruthlessly small)

1. **Group** — a manager creates one, gets an invite link/code.
2. **Members** — anyone with the link joins with just a name + a way to be reached (phone number or email, pick one — see open questions).
3. **Events** — manager creates events (date, time, location, optional notes). Recurring events are essential, not a "v2 feature" — most teams train on the same weeknight every week.
4. **RSVP** — each member taps Yes / No / Maybe on an event. That's it.
5. **Manager view** — a single screen per event showing who's in, who's out, who hasn't answered, with a count.
6. **Reminders** — automated nudge to people who haven't RSVP'd, X hours before the event. This is what makes the loop actually work.

That's the whole v1. If this part isn't great, nothing else matters.

## Design principles I'd push for

- **Mobile-first, web-based.** A PWA beats native apps for this. Players will not install yet another app for the one team they're casually on. The manager might, but even they don't need to.
- **Zero-friction joining.** A player should be able to RSVP within 30 seconds of receiving the invite link, without creating a password, without installing anything. Magic link or one-time SMS code only.
- **Notifications are sacred.** Over-notifying kills these apps. One reminder per event, maybe one digest for the manager. No "Bob updated his profile picture" garbage.
- **The manager is the power user; the player is a tourist.** Optimize the player experience for "I open this once a week, tap one thing, close it." Optimize the manager experience for "I live in this thing on Sunday evenings."
- **Don't over-abstract the domain yet.** The README mentions generalizing to activity groups later. Agreed *as a constraint on naming* — call things `Group` and `Event`, not `Team` and `Match` — but resist building a generic schema engine. Ship the sports-shaped MVP with neutral names.

## Things I'd explicitly leave OUT of v1

- Chat / messaging. The team's WhatsApp group already exists and is fine. Competing with it loses.
- Payments / dues collection. Real value, but legally and operationally heavy. Phase 2.
- Stats, results, league tables. Nice-to-have for some, irrelevant for most. Phase 2+.
- Lineups / formations / position assignment. Sport-specific, hard to generalize, very few managers actually use these features in competing apps.
- Multi-team / federation / club hierarchies. Most managers manage one team. Don't build for the org chart until users ask.
- A user "profile" with photo, bio, etc. Nobody fills these in and they create privacy/safeguarding issues for youth teams.

## Things I'd want to know before going further

- **Who's the primary user — manager, coach, or player?** They have very different needs. I'd build for the manager first.
- **Adult amateur teams, youth teams, or both?** Youth teams introduce parent-as-proxy, safeguarding, GDPR-for-minors concerns that change the design significantly.
- **One sport or many from day one?** Even within sports, soccer/football vs. running club vs. climbing group have different rhythms.
- **What language(s) / region?** Affects SMS costs, payment providers, GDPR posture.
- **Phone number or email for identity?** Phone is lower-friction for casual users but adds SMS costs and complicates a web-first approach. Email is cheaper, more web-native, but higher friction for younger players.
- **Free, freemium, or paid?** Affects whether to over-engineer for scale.
- **Are the team managers you're brainstorming with going to be design partners / first users?** If yes, that's gold — build for them specifically and resist the urge to generalize.

## Tech stack — my first instinct

Not asking you to commit, just declaring my prior:

- **Stack:** TypeScript everywhere. Next.js or Remix on the frontend (PWA-capable). Postgres. Hosted somewhere boring (Vercel/Railway/Fly).
- **Auth:** Magic-link email via something like Resend + a tiny custom flow. Skip OAuth providers in v1.
- **Why:** Minimizes moving parts, one language across the stack, easy to hand off later, no platform lock-in beyond the database.

I'd push back hard on anything that adds native mobile, microservices, or a separate API layer at this stage.

## What I'd build the first weekend

If I had to ship something usable in a weekend, in order:

1. Postgres schema: `users`, `groups`, `memberships`, `events`, `rsvps`.
2. Magic-link auth.
3. Create-group + invite-link flow.
4. Create-event form.
5. Event page with Yes/No/Maybe buttons and a live attendance list.
6. Deploy. Send the link to one real team. Watch what breaks.

Everything after that is informed by what actually went wrong with one real team using it once.

---

# Round 2 — after answers from user

Updates based on: coach is the primary user; adult amateur first but youth supported; US/English only; tiered pricing (free → multi-team paid → league paid); **first real user runs a pick-up game with Venmo + WhatsApp, first 20 paid are in**.

## The biggest shift: pick-up ≠ team

The first real user doesn't have a team-management problem. He has an **event-ticketing problem**. Payment *is* the RSVP. The roster is whoever paid first. This is a meaningfully different shape from a weekly training where you ask "who's coming?"

I'd model two event types from day one — same underlying primitives, distinct UX:

- **Open event** (pick-up): capacity N, first-to-confirm wins a spot, automatic waitlist, payment = confirmation.
- **Roster event** (team): fixed member list, Yes/No/Maybe, no payment by default.

Build the **open event** flow first, because that's the actual first user. The team-roster flow comes second, once there's a second user who needs it. This reverses my earlier instinct.

## Venmo tracking — honest take

"Connect to Venmo and auto-match payments to players" sounds like a small feature. It isn't. Personal Venmo has **no public API**. Realistic options, worst to best:

1. **Scrape the Venmo account.** Against ToS, fragile, will break in a Venmo redesign. Don't.
2. **Forward Venmo notification emails to an inbox the app parses.** Works today, depends on Venmo's email format staying stable, requires the coach to set up forwarding. Brittle but feasible.
3. **Manual mark-as-paid in a fast UI.** Coach gets the Venmo push on their phone, taps a name in our app. Boring, bulletproof, ships this week.
4. **Venmo Business profile.** Has limited APIs but requires a business setup the coach almost certainly doesn't want for a weekly pick-up.

My recommendation: **v1 is manual mark-as-paid.** Optimize the *speed* of that interaction (search-as-you-type, recent-payer suggestions, one-tap toggle) rather than promising automation we can't reliably deliver. Explore option 2 (email forwarding) in v1.5 once we know the real volume and the coach is hooked.

Important: avoid framing this to users as "connect your Venmo." That phrase sets an expectation we'll struggle to meet. Frame it as "track payments" — manual today, smarter later.

## What does the first user actually want replaced?

He has WhatsApp (comm) + Venmo (payment) + his own mental list (roster). My read: he wants the app to **replace the mental list only**. WhatsApp and Venmo stay.

If that's right, the MVP for him is smaller than even my first sketch:

- One page per game showing the first-20 list + a waitlist.
- A way for the coach to mark a player as paid (one tap, fast).
- A public/shareable URL the coach drops in the WhatsApp group so players can see the live list.

That's a weekend of work and could be in his hands within days. RSVPs, reminders, profiles, all the team-shaped stuff — defer until a second user actually needs them.

Worth confirming with him directly before building, though — I'm guessing about his mental model.

## Tier strategy — two notes

The free → multi-team → league progression is sensible, but:

- **Tier 3 (league management) is a different product**, not a bigger version of tier 2. Cross-team scheduling, referee assignment, standings, fixtures, disputes, eligibility rules — it's its own genre with established competitors. Keep it aspirational, not roadmap.
- **What's the upgrade pressure from free to paid?** If the free tier includes payment tracking + one team, the paid tier needs something a single-team coach genuinely envies. Multi-team admin alone might not be it. Worth deciding early: roles/permissions, co-coach delegation, custom branding, history/reporting, integrations — which of these are paid features?

## Youth teams — flagging the real cost

US youth support adds nontrivial complexity:

- **COPPA**: under-13s can't have accounts in their own name. Parent-as-proxy is mandatory.
- Parent receives notifications; child may not be in the app at all.
- Photos / rosters of minors create safeguarding obligations.
- Affects auth, data model, notification routing, and UI (one parent managing multiple kids on different teams).

Recommendation: design the data model so a `Member` can be **represented by** a separate `User` (parent proxy), but don't build the youth-specific flows until the adult MVP is solid. And don't *market* youth support until it's properly built — youth coaches will notice the rough edges instantly.

## Revised MVP for the real first user

In priority order:

1. Group + members + magic-link join.
2. **Open event** with capacity (default 20) + waitlist.
3. **Mark-as-paid** UI for the coach (fast).
4. **Public game-status page** at a shareable URL.
5. Roles: `coach` and `member`. Co-coach can come right after — same permissions as coach for now; don't over-design the role system before there's a use case for "view-only" or "assistant".

That's it for v1. Reminders, RSVPs, recurring events, history — all deferred until validated.

## New open questions

- **Self-claim vs. coach-claim?** Should players go to the link and tap "I'm in" (and then coach marks paid), or does the coach add players themselves when a Venmo notification arrives? Self-claim scales better long-term; coach-claim is faster to build and matches his current habit. I'd start with coach-claim and add self-claim later.
- **Co-coach permissions.** Identical to head coach, or is there a "view-only / assistant" tier? Defer unless a real user asks.
- **Payment history.** Does the coach care about "Bob has paid 8 of the last 10 weeks"? Or only "who paid this week"? Affects whether we store payment records as a log or just a per-event flag.
- **Identity for players.** Phone number, email, or just a name + the magic link? For a pick-up game where the coach knows everyone by name, you could get away with no real auth at all — the shareable link IS the auth. Worth considering.
- **One game per week or multiple?** Affects whether "the game" is a singleton or whether we need full event scheduling on day one.

---

# Round 3 — second pick-up group + team queued behind

Updates: a **second pick-up group** is lined up to test (no payment — players just say in the WhatsApp chat whether they're playing), and an **adult amateur team** with practice sessions and a game calendar is queued as an early user too.

## What this changes

**Payment moves from "feature of the open-event flow" to "pluggable layer on top of it."**

Round 2 treated payment and capacity-management as tangled — the open event was payment-gated by design. Round 3 untangles them. The cleaner abstraction:

- **Open event** = a slot-based event with capacity N and a waitlist.
- **Confirmation** = whatever takes a slot. Three valid types:
  - Player taps "I'm in" (pick-up #2 today, also pick-up #1 in confirm-only mode)
  - Coach marks player as paid (pick-up #1 once payment-tracking ships)
  - (Future) Some other trigger — Stripe webhook, integration, etc.

This is meaningfully better than where Round 2 left things. The open-event MVP now ships *without* payment tracking, which removes the riskiest engineering work from the critical path. Payment becomes additive, not blocking.

## The three-user spectrum is a gift, not a complication

| User | Shape | Confirmation | Schedule |
|---|---|---|---|
| Pick-up #2 | Open, capped | Player taps | Single game |
| Pick-up #1 | Open, capped | Coach marks paid | Single game |
| Adult team | Fixed roster | Yes / No / Maybe | Recurring practice + game calendar |

Three users at three points on the structure spectrum is the ideal validation lineup. They share enough that one engine serves all of them; they differ enough that premature abstractions show up immediately. The biggest risk is trying to please all three at once and shipping nothing — so the sequencing matters.

## Revised build order

1. **Open event + player-tap confirmation + capacity + waitlist + shareable URL** → pick-up #2 lives on it.
2. **Mark-as-paid layer for the coach** → pick-up #1 lives on it (until then, runs in confirm-only mode).
3. **Roster event + Yes/No/Maybe RSVPs + recurring events** → adult team starts using it for practice.
4. **Game calendar separate from practice events** → completes team workflow.

Each phase has a real user waiting at the end of it — the best possible forcing function.

## Watchout

Resist building team features in parallel "because we know they're coming." Pick-up #2 will surface 80% of the bugs and UX questions the team would hit anyway. Roster/RSVP/recurring-event design gets cleaner once the open-event flow has been stress-tested by real users. Knowing the team is coming should influence the *data model* (don't paint yourself into a corner) but not the *build order*.

## What's now de-risked vs. still risky

**De-risked:**
- The MVP no longer hinges on payment tracking. The technically thorniest piece moves to phase 2.
- Two pick-up users using the same flow means UX questions get validated quickly without needing to balance two product shapes at once.

**Still risky:**
- The team flow is a real product shift (fixed roster, RSVPs vs. confirmations, recurring events, separate game calendar). The data model needs to accommodate it from the start without prematurely building it.
- Venmo tracking is still the hardest engineering bet in the roadmap. Phase 2 should start with the realistic options laid out in Round 2 (manual mark-as-paid as the floor, email-forwarding parsing as the stretch).
