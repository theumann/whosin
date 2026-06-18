import type { Event } from "@prisma/client";
import { DateTimeInput } from "./DateTimeInput";
import { btnPrimary, fieldClass, labelClass } from "@/lib/ui";

// Format a Date for a datetime-local input (browser-local wall-clock time).
function toLocalInput(d?: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({
  action,
  event,
  submitLabel,
  allowRecurring = false,
}: {
  action: (formData: FormData) => void;
  event?: Event | null;
  submitLabel: string;
  allowRecurring?: boolean;
}) {
  return (
    <form action={action}>
      <label className={labelClass}>
        Date &amp; time<span className="text-red-600"> *</span>
        <DateTimeInput
          name="startsAt"
          required
          defaultValue={toLocalInput(event?.startsAt)}
          className={`${fieldClass} mt-1`}
        />
      </label>
      <label className={labelClass}>
        Location
        <input
          name="location"
          defaultValue={event?.location ?? ""}
          placeholder="e.g. Riverside Park, Field 2"
          className={`${fieldClass} mt-1`}
        />
      </label>
      <label className={labelClass}>
        Capacity (max players)
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={event?.capacity ?? ""}
          placeholder="Leave blank for no limit"
          className={`${fieldClass} mt-1`}
        />
      </label>
      <label className={labelClass}>
        Notes
        <textarea
          name="notes"
          defaultValue={event?.notes ?? ""}
          rows={2}
          className={`${fieldClass} mt-1 resize-y`}
        />
      </label>

      {allowRecurring ? (
        <fieldset className="mb-4 rounded-lg border border-slate-300 px-3.5 py-3">
          <legend className="px-1.5 text-xs text-slate-500">Repeat</legend>
          <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
            <input name="recurring" type="checkbox" />
            Repeat this event (uses the date &amp; time above as the first occurrence)
          </label>
          <label className={labelClass}>
            Every N weeks
            <input
              name="intervalWeeks"
              type="number"
              min={1}
              defaultValue={1}
              className={`${fieldClass} mt-1`}
            />
          </label>
          <label className={labelClass}>
            Repeat until (end date)
            <input name="endDate" type="date" className={`${fieldClass} mt-1`} />
          </label>
        </fieldset>
      ) : null}

      <button type="submit" className={`${btnPrimary} mt-2`}>
        {submitLabel}
      </button>
    </form>
  );
}
