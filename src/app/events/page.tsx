import Image from "next/image";
import Link from "next/link";
import { Pencil, Repeat } from "lucide-react";
import { getCurrentGroupId } from "@/server/coach";
import { listUpcomingEventsPaged, listPastEventsPaged } from "@/server/services/events";
import { btnSecondary, errorBanner } from "@/lib/ui";
import { formatEventDate } from "@/lib/dateFormat";
import { CreateEventModal } from "./CreateEventModal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Event = Awaited<ReturnType<typeof listUpcomingEventsPaged>>[number];

function EventRow({ event: e, currentYear }: { event: Event; currentYear: number }) {
  const inCount = e.entries.filter((x) => x.status === "IN").length;
  return (
    <li className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 last:border-b-0">
      <Link href={`/events/${e.id}`} className="text-slate-900 no-underline">
        <strong>{formatEventDate(e.startsAt, currentYear)}</strong>
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
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-sm text-slate-500">
          {inCount}
          {e.capacity != null ? ` / ${e.capacity}` : ""} in
        </span>
        <Link
          href={`/events/${e.id}`}
          aria-label="View event"
          className="text-slate-400 transition-colors hover:text-indigo-600"
        >
          <Pencil size={15} />
        </Link>
      </div>
    </li>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string; page?: string }>;
}) {
  const { error, tab = "upcoming", page: pageStr = "0" } = await searchParams;
  const page = Math.max(0, parseInt(pageStr, 10) || 0);
  const skip = page * PAGE_SIZE;
  const currentYear = new Date().getFullYear();

  const groupId = await getCurrentGroupId();
  const isPast = tab === "past";

  const rawEvents = isPast
    ? await listPastEventsPaged(groupId, skip, PAGE_SIZE)
    : await listUpcomingEventsPaged(groupId, skip, PAGE_SIZE);

  const hasNextPage = rawEvents.length > PAGE_SIZE;
  const events = rawEvents.slice(0, PAGE_SIZE);

  const tabHref = (t: string) => `?tab=${t}&page=0`;
  const pageHref = (p: number) => `?tab=${tab}&page=${p}`;

  const activeTab =
    "border-b-2 border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600";
  const inactiveTab = "px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700";

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/" aria-label="Home">
        <Image src="/logo.png" alt="whosIn" width={120} height={40} priority />
      </Link>
      <h1 className="mb-1 mt-4 text-[22px] font-bold">Events</h1>

      {error ? <p className={`${errorBanner} mt-4`}>{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <CreateEventModal />
      </div>

      <div className="mt-3 rounded-lg border border-slate-200">
        <div className="flex border-b border-slate-200">
          <Link href={tabHref("upcoming")} className={!isPast ? activeTab : inactiveTab}>
            Upcoming
          </Link>
          <Link href={tabHref("past")} className={isPast ? activeTab : inactiveTab}>
            Past
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="px-4 py-6 text-slate-400">
            {isPast ? "No past events." : "No upcoming events yet."}
          </p>
        ) : (
          <ul className="m-0 list-none p-0">
            {events.map((e) => (
              <EventRow key={e.id} event={e} currentYear={currentYear} />
            ))}
          </ul>
        )}

        {(page > 0 || hasNextPage) && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            {page > 0 ? (
              <Link href={pageHref(page - 1)} className={btnSecondary}>
                ← Previous {PAGE_SIZE}
              </Link>
            ) : (
              <span />
            )}
            {hasNextPage ? (
              <Link href={pageHref(page + 1)} className={btnSecondary}>
                Next {PAGE_SIZE} →
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
