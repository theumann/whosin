import Link from "next/link";
import { House, Repeat } from "lucide-react";
import { getCurrentGroupId } from "@/server/coach";
import { listEvents } from "@/server/services/events";
import { EventForm } from "@/components/EventForm";
import { addEventAction } from "./actions";
import { errorBanner, linkAccent } from "@/lib/ui";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const VISIBLE_EVENT_COUNT = 3;

function EventRow({ event: e }: { event: Awaited<ReturnType<typeof listEvents>>[number] }) {
  const inCount = e.entries.filter((x) => x.status === "IN").length;
  return (
    <li className="flex items-center justify-between gap-3 border-b border-slate-200 py-2.5">
      <Link href={`/events/${e.id}`} className="text-slate-900 no-underline">
        <strong>{dateFmt.format(e.startsAt)}</strong>
        {e.seriesId ? (
          <span
            title="Part of a recurring series"
            className="ml-2 inline-flex items-center text-indigo-600"
          >
            <Repeat size={14} />
          </span>
        ) : null}
        {e.canceledAt ? <span className="ml-2 text-sm text-red-600">CANCELED</span> : null}
        {e.location ? <div className="text-sm text-slate-400">{e.location}</div> : null}
      </Link>
      <span className="whitespace-nowrap text-sm text-slate-500">
        {inCount}
        {e.capacity != null ? ` / ${e.capacity}` : ""} in
      </span>
    </li>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const groupId = await getCurrentGroupId();
  const events = await listEvents(groupId);
  const visibleEvents = events.slice(0, VISIBLE_EVENT_COUNT);
  const restEvents = events.slice(VISIBLE_EVENT_COUNT);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/" aria-label="Home" className={`inline-flex items-center ${linkAccent}`}>
        <House size={20} />
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Events</h1>
      <p className="mt-0 text-slate-500">
        {events.length} {events.length === 1 ? "event" : "events"}
      </p>

      {error ? <p className={`${errorBanner} mt-4`}>{error}</p> : null}

      <section className="mt-6">
        {events.length === 0 ? (
          <p className="text-slate-400">No events yet. Create your first below.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {visibleEvents.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </ul>
        )}
        {restEvents.length > 0 ? (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-slate-500">
              Show {restEvents.length} more
            </summary>
            <ul className="m-0 list-none p-0">
              {restEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Create an event</h2>
        <EventForm action={addEventAction} submitLabel="Create event" allowRecurring />
      </section>
    </main>
  );
}
