import Link from "next/link";
import { notFound } from "next/navigation";
import type { EntryStatus, Squad } from "@prisma/client";
import { getEventWithRoster } from "@/server/services/events";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from "@/lib/status";
import {
  buildCanceledMessage,
  buildHeader,
  buildRosterBody,
  buildSquadBody,
  whatsappShareUrl,
  type EventMessageData,
} from "@/lib/messages";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";
import {
  deleteEventAction,
  setCanceledAction,
  setSquadAction,
  setStatusAction,
} from "../actions";

export const dynamic = "force-dynamic";

const SQUAD_COLORS: Record<Squad, string> = { A: "#38bdf8", B: "#c084fc" };
const SQUAD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "", label: "—" },
];

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventWithRoster(id);
  if (!event) notFound();

  const counts = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = event.entries.filter((e) => e.status === s).length;
      return acc;
    },
    {} as Record<EntryStatus, number>,
  );
  const inCount = counts.IN;
  const overCapacity = event.capacity != null && inCount > event.capacity;

  // Squad split applies to the players who are In.
  const inEntries = event.entries.filter((e) => e.status === "IN");
  const squadA = inEntries.filter((e) => e.squad === "A");
  const squadB = inEntries.filter((e) => e.squad === "B");
  const unassigned = inEntries.filter((e) => e.squad == null);

  const msgData: EventMessageData = {
    groupName: event.group.name,
    startsAt: event.startsAt,
    location: event.location,
    capacity: event.capacity,
    entries: event.entries,
  };
  const headerText = buildHeader(msgData);
  const rosterBody = buildRosterBody(msgData);
  const squadBody = buildSquadBody(msgData);
  const canceledShareUrl = whatsappShareUrl(buildCanceledMessage(msgData));

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/events" style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
        &larr; Events
      </Link>

      <h1 style={{ marginBottom: "0.25rem" }}>{dateFmt.format(event.startsAt)}</h1>
      {event.canceledAt ? (
        <p style={{ color: "#f87171", fontWeight: 600, marginTop: 0 }}>CANCELED</p>
      ) : null}
      {event.location ? <p style={{ color: "#94a3b8", marginTop: 0 }}>{event.location}</p> : null}
      {event.notes ? <p style={{ color: "#cbd5e1" }}>{event.notes}</p> : null}

      {/* Capacity indicator + per-status counts */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "1rem",
          flexWrap: "wrap",
          margin: "1rem 0",
        }}
      >
        <span style={{ fontSize: "1.4rem", fontWeight: 700, color: overCapacity ? "#f87171" : "#22c55e" }}>
          {inCount}
          {event.capacity != null ? ` / ${event.capacity}` : ""} in
        </span>
        {STATUS_ORDER.filter((s) => s !== "IN").map((s) => (
          <span key={s} style={{ color: STATUS_COLORS[s], fontSize: "0.85rem" }}>
            {counts[s]} {STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link href={`/events/${event.id}/edit`} style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
          Edit event
        </Link>
        <form action={setCanceledAction.bind(null, event.id, !event.canceledAt)}>
          <button type="submit" style={linkButton("#fb923c")}>
            {event.canceledAt ? "Un-cancel" : "Cancel game"}
          </button>
        </form>
        <form action={deleteEventAction.bind(null, event.id)}>
          <button type="submit" style={linkButton("#f87171")}>
            Delete event
          </button>
        </form>
      </div>

      {/* Squad split summary */}
      {inEntries.length > 0 ? (
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Teams</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {(["A", "B"] as const).map((sq) => {
              const members = sq === "A" ? squadA : squadB;
              return (
                <div
                  key={sq}
                  style={{
                    flex: "1 1 200px",
                    border: `1px solid ${SQUAD_COLORS[sq]}`,
                    borderRadius: 8,
                    padding: "0.6rem 0.8rem",
                  }}
                >
                  <strong style={{ color: SQUAD_COLORS[sq] }}>
                    Team {sq} ({members.length})
                  </strong>
                  {members.length ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: "0.4rem 0 0" }}>
                      {members.map((e) => (
                        <li key={e.id} style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
                          {e.player.firstName}
                          {e.player.lastName ? ` ${e.player.lastName}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.4rem 0 0" }}>
                      No one yet
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {unassigned.length ? (
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              {unassigned.length} In, not yet assigned to a team
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Per-player status control */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {event.entries.map((entry) => (
          <li
            key={entry.id}
            style={{
              padding: "0.55rem 0",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span>
                <strong>{entry.player.firstName}</strong>
                {entry.player.lastName ? ` ${entry.player.lastName}` : ""}
                {entry.status === "IN" && entry.squad ? (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      color: SQUAD_COLORS[entry.squad],
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    Team {entry.squad}
                  </span>
                ) : null}
              </span>
              <form action={setStatusAction.bind(null, event.id, entry.playerId)} style={{ display: "flex", gap: "0.3rem" }}>
                {STATUS_ORDER.map((s) => {
                  const active = entry.status === s;
                  return (
                    <button
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      style={{
                        padding: "0.3rem 0.55rem",
                        borderRadius: 6,
                        border: `1px solid ${active ? STATUS_COLORS[s] : "#334155"}`,
                        background: active ? STATUS_COLORS[s] : "transparent",
                        color: active ? "#0b1220" : "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: active ? 700 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </form>
            </div>

            {/* Squad assignment — only for In players */}
            {entry.status === "IN" ? (
              <form
                action={setSquadAction.bind(null, event.id, entry.playerId)}
                style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem" }}
              >
                <span style={{ color: "#64748b", fontSize: "0.75rem", marginRight: "0.2rem" }}>Team:</span>
                {SQUAD_OPTIONS.map((opt) => {
                  const active =
                    (opt.value === "" && entry.squad == null) || entry.squad === opt.value;
                  const color = opt.value ? SQUAD_COLORS[opt.value as Squad] : "#64748b";
                  return (
                    <button
                      key={opt.value || "none"}
                      type="submit"
                      name="squad"
                      value={opt.value}
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: 6,
                        border: `1px solid ${active ? color : "#334155"}`,
                        background: active ? color : "transparent",
                        color: active ? "#0b1220" : "#94a3b8",
                        fontSize: "0.75rem",
                        fontWeight: active ? 700 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Broadcast to WhatsApp */}
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Send to WhatsApp</h2>
        {event.canceledAt ? (
          <p style={{ marginBottom: "1rem" }}>
            <a
              href={canceledShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.55rem 1.1rem",
                borderRadius: 6,
                background: "#fb923c",
                color: "#0b1220",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              📣 Share cancellation
            </a>
          </p>
        ) : null}
        <WhatsAppComposer header={headerText} roster={rosterBody} squad={squadBody} />
        <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.6rem" }}>
          Opens WhatsApp with the message ready — pick your group and send.
        </p>
      </section>
    </main>
  );
}

function linkButton(color: string): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    color,
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: 0,
  };
}
