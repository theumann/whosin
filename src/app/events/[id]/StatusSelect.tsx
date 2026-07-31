"use client";

import { useRef } from "react";

const OPTIONS = [
  { value: "DEFAULT", label: "—" },
  { value: "IN", label: "In" },
  { value: "WAITLIST", label: "Wait List" },
  { value: "INJURY", label: "Injury Reserve" },
] as const;

const COLORS: Record<string, string> = {
  IN: "#16a34a",
  WAITLIST: "#d97706",
  INJURY: "#dc2626",
  DEFAULT: "#94a3b8",
};

export function StatusSelect({
  current,
  action,
}: {
  current: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <select
        key={current}
        name="status"
        defaultValue={current}
        onChange={() => formRef.current?.requestSubmit()}
        style={{ color: COLORS[current] ?? COLORS.DEFAULT }}
        className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-semibold shadow-sm focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} style={{ color: COLORS[o.value] }}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
