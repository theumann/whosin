"use client";

// Native datetime-local input that opens the browser's picker when you click
// anywhere in the field (not just the small calendar icon). Keeps the zero-
// dependency native picker while fixing the "nothing pops up" UX.
export function DateTimeInput({
  name,
  defaultValue,
  required,
  className,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  function openPicker(e: React.MouseEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch {
        // showPicker can throw if not user-activated; the icon still works.
      }
    }
  }

  return (
    <input
      name={name}
      type="datetime-local"
      required={required}
      defaultValue={defaultValue}
      onClick={openPicker}
      className={className}
    />
  );
}
