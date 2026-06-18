import type { Event } from "@prisma/client";
import { DateTimeInput } from "./DateTimeInput";

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "0.5rem 0.6rem",
  marginTop: "0.25rem",
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e2e8f0",
  fontSize: "0.95rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.75rem",
  color: "#cbd5e1",
  fontSize: "0.85rem",
};

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
      <label style={labelStyle}>
        Date &amp; time<span style={{ color: "#f87171" }}> *</span>
        <DateTimeInput
          name="startsAt"
          required
          defaultValue={toLocalInput(event?.startsAt)}
          style={fieldStyle}
        />
      </label>
      <label style={labelStyle}>
        Location
        <input
          name="location"
          defaultValue={event?.location ?? ""}
          placeholder="e.g. Riverside Park, Field 2"
          style={fieldStyle}
        />
      </label>
      <label style={labelStyle}>
        Capacity (max players)
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={event?.capacity ?? ""}
          placeholder="Leave blank for no limit"
          style={fieldStyle}
        />
      </label>
      <label style={labelStyle}>
        Notes
        <textarea
          name="notes"
          defaultValue={event?.notes ?? ""}
          rows={2}
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      </label>

      {allowRecurring ? (
        <fieldset
          style={{
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "0.75rem 0.9rem",
            marginBottom: "1rem",
          }}
        >
          <legend style={{ color: "#94a3b8", fontSize: "0.8rem", padding: "0 0.4rem" }}>
            Repeat
          </legend>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#cbd5e1",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            <input name="recurring" type="checkbox" />
            Repeat this event (uses the date &amp; time above as the first occurrence)
          </label>
          <label style={labelStyle}>
            Every N weeks
            <input name="intervalWeeks" type="number" min={1} defaultValue={1} style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            Repeat until (end date)
            <input name="endDate" type="date" style={fieldStyle} />
          </label>
        </fieldset>
      ) : null}

      <button
        type="submit"
        style={{
          marginTop: "0.5rem",
          padding: "0.55rem 1.1rem",
          borderRadius: 6,
          border: "none",
          background: "#2563eb",
          color: "white",
          fontSize: "0.95rem",
          cursor: "pointer",
        }}
      >
        {submitLabel}
      </button>
    </form>
  );
}
