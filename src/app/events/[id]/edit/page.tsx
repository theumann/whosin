import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEvent } from "@/server/services/events";
import { EventForm } from "@/components/EventForm";
import { updateEventAction } from "../../actions";
import { errorBanner, linkAccent } from "@/lib/ui";

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
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href={`/events/${event.id}`}
        className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}
      >
        <ArrowLeft size={16} /> Back to event
      </Link>
      <h1 className="text-2xl font-bold">Edit event</h1>

      {error ? <p className={`${errorBanner} mb-4`}>{error}</p> : null}

      <EventForm
        action={updateEventAction.bind(null, event.id)}
        event={event}
        submitLabel="Save changes"
      />
    </main>
  );
}
