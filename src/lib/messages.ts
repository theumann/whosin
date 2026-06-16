import type { EntryStatus, Squad } from "@prisma/client";

// Pure WhatsApp message builders. No DB, no React — usable from server
// components today and a future native client. Pending Answer (DEFAULT) is
// intentionally never published.

type MessagePlayer = { firstName: string; lastName: string | null };
type MessageEntry = { status: EntryStatus; squad?: Squad | null; player: MessagePlayer };

export type EventMessageData = {
  groupName: string;
  startsAt: Date;
  location: string | null;
  capacity: number | null;
  entries: MessageEntry[];
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function header(d: EventMessageData): string {
  let h = `${d.groupName} — ${dateFmt.format(d.startsAt)}`;
  if (d.location) h += ` @ ${d.location}`;
  return h;
}

function fullName(p: MessagePlayer): string {
  return p.lastName ? `${p.firstName} ${p.lastName}` : p.firstName;
}

// Just the event title line — used as the base when the roster is toggled off.
export function buildHeader(d: EventMessageData): string {
  return header(d);
}

// Grouped roster: In / Wait List / Injury Reserve. Pending Answer omitted.
// Empty sections are skipped.
export function buildRosterBody(d: EventMessageData): string {
  const sections: Array<[EntryStatus, string]> = [
    ["IN", "✅ In"],
    ["WAITLIST", "⏳ Wait List"],
    ["INJURY", "🩹 Injury Reserve"],
  ];
  const lines: string[] = [];
  for (const [status, label] of sections) {
    const players = d.entries.filter((e) => e.status === status);
    if (!players.length) continue;
    const cap = status === "IN" && d.capacity != null ? `/${d.capacity}` : "";
    lines.push(`${label} (${players.length}${cap}):`);
    for (const e of players) lines.push(`• ${fullName(e.player)}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

// Team A / Team B split among In players. Returns "" if no split is done yet
// (no In player is assigned to a squad), which the UI uses to disable the
// "include squad split" toggle.
export function buildSquadBody(d: EventMessageData): string {
  const assigned = d.entries.filter(
    (e) => e.status === "IN" && (e.squad === "A" || e.squad === "B"),
  );
  if (!assigned.length) return "";

  const sections: Array<[Squad, string]> = [
    ["A", "🅰️ Team A"],
    ["B", "🅱️ Team B"],
  ];
  const lines: string[] = [];
  for (const [sq, label] of sections) {
    const players = assigned.filter((e) => e.squad === sq);
    if (!players.length) continue;
    lines.push(`${label} (${players.length}):`);
    for (const e of players) lines.push(`• ${fullName(e.player)}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function buildCanceledMessage(d: EventMessageData): string {
  return `${header(d)}\n\n❌ This game is CANCELED. See you next time!`;
}

// wa.me deep link: opens WhatsApp with the message pre-filled; the coach picks
// the group and sends. ToS-compliant, nothing to maintain.
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
