// Pure recurrence math — no DB, no framework. Given a first occurrence, an end
// date, and a weekly interval, returns the datetime of each occurrence.
//
// Weeks are added by calendar day (setDate) rather than by milliseconds, so the
// wall-clock time of day is preserved across DST boundaries.

const MAX_OCCURRENCES = 200; // safety cap against runaway generation

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function occurrenceDates(firstStartsAt: Date, endDate: Date, intervalWeeks: number): Date[] {
  const interval = Math.max(1, Math.floor(intervalWeeks));
  const lastMs = endOfDay(endDate).getTime();
  const dates: Date[] = [];
  let current = new Date(firstStartsAt);
  while (current.getTime() <= lastMs && dates.length < MAX_OCCURRENCES) {
    dates.push(new Date(current));
    current = addWeeks(current, interval);
  }
  return dates;
}
