import Link from "next/link";
import { notFound } from "next/navigation";
import type { EntryStatus, Squad } from "@prisma/client";
import { ArrowLeft, Megaphone, Pencil, Repeat, Trash2 } from "lucide-react";
import { getEventWithRoster } from "@/server/services/events";
import { getCurrentGroupId } from "@/server/coach";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from "@/lib/status";
import { SQUAD_COLORS } from "@/lib/squad";
import {
  buildCanceledMessage,
  buildHeader,
  buildRosterBody,
  buildSquadBody,
  whatsappShareUrl,
  type EventMessageData,
} from "@/lib/messages";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";
import { StatusSelect } from "./StatusSelect";
import {
  deleteEventAction,
  deleteSeriesAction,
  setCanceledAction,
  setSquadAction,
  setStatusAction,
} from "../actions";
import { btnDanger, btnWarning, linkAccent } from "@/lib/ui";

export const dynamic = "force-dynamic";

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
  const groupId = await getCurrentGroupId();
  const event = await getEventWithRoster(groupId, id);
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
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/events" className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}>
        <ArrowLeft size={16} /> Events
      </Link>

      <h1 className="mb-1 mt-4 flex items-center gap-2.5 text-[22px] font-bold">
        {dateFmt.format(event.startsAt)}
        {event.seriesId ? (
          <span
            title="Part of a recurring series"
            className="inline-flex items-center gap-1 text-sm font-normal text-indigo-600"
          >
            <Repeat size={15} /> recurring
          </span>
        ) : null}
      </h1>
      {event.canceledAt ? <p className="mt-0 font-semibold text-red-600">CANCELED</p> : null}
      {event.location ? <p className="mt-0 text-slate-500">{event.location}</p> : null}
      {event.notes ? <p className="text-slate-700">{event.notes}</p> : null}

      {/* Capacity indicator + per-status counts */}
      <div className="my-4 flex flex-wrap items-baseline gap-4">
        <span
          className={`text-[22px] font-bold ${overCapacity ? "text-red-600" : "text-emerald-600"}`}
        >
          {inCount}
          {event.capacity != null ? ` / ${event.capacity}` : ""} in
        </span>
        {STATUS_ORDER.filter((s) => s !== "IN").map((s) => (
          <span key={s} style={{ color: STATUS_COLORS[s] }} className="text-sm">
            {counts[s]} {STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/events/${event.id}/edit`}
          className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}
        >
          <Pencil size={14} /> Edit event
        </Link>
        <form action={setCanceledAction.bind(null, event.id, !event.canceledAt)}>
          <button type="submit" className={btnWarning}>
            {event.canceledAt ? "Un-cancel" : "Cancel event"}
          </button>
        </form>
        <form action={deleteEventAction.bind(null, event.id)}>
          <button type="submit" className={btnDanger}>
            <Trash2 size={14} /> Delete event
          </button>
        </form>
        {event.seriesId ? (
          <form action={deleteSeriesAction.bind(null, event.seriesId)}>
            <button type="submit" className={btnDanger}>
              <Trash2 size={14} /> Delete series (future events)
            </button>
          </form>
        ) : null}
      </div>

      {/* Squad split summary */}
      {inEntries.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Teams</h2>
          <div className="flex flex-wrap gap-4">
            {(["A", "B"] as const).map((sq) => {
              const members = sq === "A" ? squadA : squadB;
              return (
                <div
                  key={sq}
                  style={{ borderColor: SQUAD_COLORS[sq] }}
                  className="flex-1 basis-48 rounded-lg border bg-white px-3.5 py-2.5 shadow-sm"
                >
                  <strong style={{ color: SQUAD_COLORS[sq] }}>
                    Team {sq} ({members.length})
                  </strong>
                  {members.length ? (
                    <ul className="m-0 mt-1.5 list-none p-0">
                      {members.map((e) => (
                        <li key={e.id} className="text-sm text-slate-700">
                          {e.player.firstName}
                          {e.player.lastName ? ` ${e.player.lastName}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 mb-0 text-sm text-slate-400">No one yet</p>
                  )}
                </div>
              );
            })}
          </div>
          {unassigned.length ? (
            <p className="mt-2 text-sm text-slate-400">
              {unassigned.length} In, not yet assigned to a team
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Per-player status control */}
      <ul className="m-0 list-none p-0">
        {event.entries.map((entry) => (
          <li key={entry.id} className="border-b border-slate-200 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span>
                <strong>{entry.player.firstName}</strong>
                {entry.player.lastName ? ` ${entry.player.lastName}` : ""}
                {entry.status === "IN" && entry.squad ? (
                  <span
                    style={{ color: SQUAD_COLORS[entry.squad] }}
                    className="ml-2 text-sm font-bold"
                  >
                    Team {entry.squad}
                  </span>
                ) : null}
              </span>
              <StatusSelect
                current={entry.status}
                action={setStatusAction.bind(null, event.id, entry.playerId)}
              />
            </div>

            {/* Squad assignment — only for In players */}
            {entry.status === "IN" ? (
              <form
                action={setSquadAction.bind(null, event.id, entry.playerId)}
                className="mt-1.5 flex items-center gap-1"
              >
                <span className="mr-0.5 text-xs text-slate-400">Team:</span>
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
                        borderColor: active ? color : undefined,
                        background: active ? color : undefined,
                        color: active ? "#ffffff" : undefined,
                      }}
                      className={`cursor-pointer rounded-md border px-2 py-0.5 text-xs font-bold transition-colors ${
                        active
                          ? ""
                          : "border-slate-300 bg-white font-normal text-slate-500 hover:border-slate-400 hover:text-slate-900"
                      }`}
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
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Send to WhatsApp</h2>
        {event.canceledAt ? (
          <p className="mb-4">
            {/* No target="_blank": same reason as share() in WhatsAppComposer —
                a tab opened for the handoff comes back pointed at a private
                content:// URI and strands the coach on a Chrome error page. */}
            <a
              href={canceledShareUrl}
              className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white no-underline shadow-sm transition-colors hover:bg-orange-600"
            >
              <Megaphone size={16} /> Share cancellation
            </a>
          </p>
        ) : null}
        <WhatsAppComposer header={headerText} roster={rosterBody} squad={squadBody} />
        <p className="mt-2.5 text-sm text-slate-400">
          Opens WhatsApp when the message is ready - pick your group and send.
        </p>
      </section>
    </main>
  );
}
