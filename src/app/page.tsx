import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { getCurrentGroupId } from "@/server/coach";
import { listUpcomingEvents } from "@/server/services/events";
import { btnSecondary, linkAccent } from "@/lib/ui";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function Home() {
  const groupId = await getCurrentGroupId();
  const events = await listUpcomingEvents(groupId, 3);

  return (
    <main className="mx-auto max-w-xl px-6 py-8">
      <Image src="/logo.png" alt="whosIn" width={120} height={40} className="mb-1" priority />
      <p className="mt-0 text-slate-500">
        Event Attendance Management and WhatsApp Group Notifications
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/events" className={`${btnSecondary} font-semibold`}>
          Manage Events
        </Link>
        <Link href="/roster" className={`${btnSecondary} font-semibold`}>
          Manage Roster
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        {events.length === 0 ? (
          <p className="mt-2 text-slate-400">No upcoming events. Create one from the Events tab.</p>
        ) : (
          <ul className="m-0 mt-2 list-none p-0">
            {events.map((e) => {
              const inCount = e.entries.filter((x) => x.status === "IN").length;
              return (
                <li key={e.id} className="border-b border-slate-200 py-2.5 last:border-b-0">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/events/${e.id}`} className="flex-1">
                      <strong className="text-slate-900">{dateFmt.format(e.startsAt)}</strong>
                      {e.location ? (
                        <div className="text-sm text-slate-400">{e.location}</div>
                      ) : null}
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/events"
          className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${linkAccent}`}
        >
          See more events <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}
