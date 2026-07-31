const fmtNoYear = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const fmtWithYear = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatEventDate(date: Date, currentYear: number): string {
  return date.getFullYear() !== currentYear ? fmtWithYear.format(date) : fmtNoYear.format(date);
}
