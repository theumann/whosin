import type { Player } from "@prisma/client";

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

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={labelStyle}>
      {label}
      {required ? <span style={{ color: "#f87171" }}> *</span> : null}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        style={fieldStyle}
      />
    </label>
  );
}

export function PlayerForm({
  action,
  player,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  player?: Player | null;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      <Field name="firstName" label="First name" defaultValue={player?.firstName} required />
      <Field name="phone" label="Phone / WhatsApp" defaultValue={player?.phone} required placeholder="+1 555 123 4567" />
      <Field name="lastName" label="Last name" defaultValue={player?.lastName} />
      <Field name="email" label="Email" type="email" defaultValue={player?.email} />
      <Field name="skillBucket" label="Skill / style bucket" defaultValue={player?.skillBucket} placeholder="e.g. A, defender, beginner" />
      <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input name="injured" type="checkbox" defaultChecked={player?.injured ?? false} />
        Injured (defaults to Injury Reserve on new events)
      </label>
      <label style={labelStyle}>
        Notes
        <textarea name="notes" defaultValue={player?.notes ?? ""} rows={2} style={{ ...fieldStyle, resize: "vertical" }} />
      </label>
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
