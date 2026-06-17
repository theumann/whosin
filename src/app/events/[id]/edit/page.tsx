import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/server/services/events";
import { EventForm } from "@/components/EventForm";
import { updateEventAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href={`/events/${event.id}`} style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
        &larr; Back to event
      </Link>
      <h1>Edit event</h1>

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

      <EventForm
        action={updateEventAction.bind(null, event.id)}
        event={event}
        submitLabel="Save changes"
      />
    </main>
  );
}
