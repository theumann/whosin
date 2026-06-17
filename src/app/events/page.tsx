import Link from "next/link";
import { getCurrentGroupId } from "@/server/coach";
import { listEvents } from "@/server/services/events";
import { EventForm } from "@/components/EventForm";
import { addEventAction } from "./actions";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const groupId = await getCurrentGroupId();
  const events = await listEvents(groupId);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/" style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
        &larr; Home
      </Link>
      <h1 style={{ marginBottom: "0.25rem" }}>Events</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>
        {events.length} {events.length === 1 ? "event" : "events"}
      </p>

      {error ? (
        <p
          style={{
            background: "#7f1d1d",
            color: "#fecaca",
            padding: "0.6rem 0.8rem",
            borderRadius: 6,
          }}
        >
          {error}
        </p>
      ) : null}

      <section style={{ marginTop: "1.5rem" }}>
        {events.length === 0 ? (
          <p style={{ color: "#64748b" }}>No events yet. Create your first below.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {events.map((e) => {
              const inCount = e.entries.filter((x) => x.status === "IN").length;
              return (
                <li
                  key={e.id}
                  style={{
                    padding: "0.7rem 0",
                    borderBottom: "1px solid #1e293b",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Link
                    href={`/events/${e.id}`}
                    style={{ color: "#e2e8f0", textDecoration: "none" }}
                  >
                    <strong>{dateFmt.format(e.startsAt)}</strong>
                    {e.seriesId ? (
                      <span
                        title="Part of a recurring series"
                        style={{ marginLeft: "0.5rem", color: "#60a5fa", fontSize: "0.8rem" }}
                      >
                        ↻
                      </span>
                    ) : null}
                    {e.canceledAt ? (
                      <span style={{ marginLeft: "0.5rem", color: "#f87171", fontSize: "0.8rem" }}>
                        CANCELED
                      </span>
                    ) : null}
                    {e.location ? (
                      <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{e.location}</div>
                    ) : null}
                  </Link>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                    {inCount}
                    {e.capacity != null ? ` / ${e.capacity}` : ""} in
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Create an event</h2>
        <EventForm action={addEventAction} submitLabel="Create event" allowRecurring />
      </section>
    </main>
  );
}
