import type { Player } from "@prisma/client";
import { btnPrimary, fieldClass, labelClass } from "@/lib/ui";

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
    <label className={labelClass}>
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={`${fieldClass} mt-1`}
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
      <Field
        name="phone"
        label="Phone / WhatsApp"
        defaultValue={player?.phone}
        required
        placeholder="+1 555 123 4567"
      />
      <Field name="lastName" label="Last name" defaultValue={player?.lastName} />
      <Field name="email" label="Email" type="email" defaultValue={player?.email} />
      <Field
        name="skillBucket"
        label="Skill / style bucket"
        defaultValue={player?.skillBucket}
        placeholder="e.g. A, defender, beginner"
      />
      <label className={`${labelClass} flex items-center gap-2`}>
        <input name="injured" type="checkbox" defaultChecked={player?.injured ?? false} />
        Injured (defaults to Injury Reserve on new events)
      </label>
      <label className={labelClass}>
        Notes
        <textarea
          name="notes"
          defaultValue={player?.notes ?? ""}
          rows={2}
          className={`${fieldClass} mt-1 resize-y`}
        />
      </label>
      <button type="submit" className={`${btnPrimary} mt-2`}>
        {submitLabel}
      </button>
    </form>
  );
}
