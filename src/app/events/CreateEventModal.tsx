"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { EventForm } from "@/components/EventForm";
import { btnPrimary, errorBanner } from "@/lib/ui";
import { addEventModalAction, type AddEventResult } from "./actions";

export function CreateEventModal() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();
  const [state, formAction] = useActionState<AddEventResult, FormData>(addEventModalAction, null);

  useEffect(() => {
    if (state && "ok" in state) {
      setOpen(false);
      if (state.eventId) {
        router.push(`/events/${state.eventId}`);
      } else {
        router.refresh();
      }
    }
  }, [state, router]);

  function openModal() {
    setOpen(true);
    setFormKey((k) => k + 1);
  }

  return (
    <>
      <button onClick={openModal} className={btnPrimary}>
        <Plus size={16} /> Create Event
      </button>

      {open && (
        <div className="fixed inset-0 z-20 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Create an event"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold">Create an event</h2>
            {state && "error" in state && <p className={`${errorBanner} mb-3`}>{state.error}</p>}
            <EventForm
              key={formKey}
              action={formAction as (formData: FormData) => void}
              submitLabel="Create event"
              allowRecurring
            />
          </div>
        </div>
      )}

      <button
        onClick={openModal}
        aria-label="Create event"
        className="fixed bottom-20 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700"
      >
        <Plus size={24} />
      </button>
    </>
  );
}
