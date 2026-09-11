// Date helpers for E2E specs. Everything here is relative to "now" on purpose:
// hard-coded dates make a spec pass until the calendar catches up, then fail
// permanently for reasons that look nothing like a date problem.

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Matches a <input type="date"> value. Built from local parts, not UTC, so the
// day doesn't shift depending on the runner's timezone.
export function dateValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Matches a <input type="datetime-local"> value.
export function dateTimeValue(d: Date): string {
  return `${dateValue(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// A future datetime `days` out, at 7pm local.
export function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(19, 0, 0, 0);
  return d;
}

// The year after the current one. Used where a spec needs an event whose year
// differs from today's, since formatEventDate only prints the year when it
// isn't the current one.
export function nextYear(): number {
  return new Date().getFullYear() + 1;
}
