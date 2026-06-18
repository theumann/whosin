import { describe, it, expect } from "vitest";
import { addWeeks, occurrenceDates } from "./recurrence";

describe("addWeeks", () => {
  it("adds calendar weeks, preserving time of day", () => {
    const d = addWeeks(new Date("2026-07-07T19:00:00"), 2);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // July
    expect(d.getDate()).toBe(21);
    expect(d.getHours()).toBe(19);
  });
});

describe("occurrenceDates", () => {
  it("generates weekly occurrences through the end date (inclusive)", () => {
    const dates = occurrenceDates(new Date("2026-07-07T19:00:00"), new Date("2026-07-28"), 1);
    // Jul 7, 14, 21, 28
    expect(dates).toHaveLength(4);
    expect(dates[0].getDate()).toBe(7);
    expect(dates[3].getDate()).toBe(28);
  });

  it("respects an every-N-weeks interval", () => {
    const dates = occurrenceDates(new Date("2026-07-07T19:00:00"), new Date("2026-08-31"), 2);
    // Jul 7, 21, Aug 4, 18 (Sep 1 is past Aug 31)
    expect(dates).toHaveLength(4);
    expect(dates.map((d) => d.getDate())).toEqual([7, 21, 4, 18]);
  });

  it("returns a single occurrence when the end date is before the next interval", () => {
    const dates = occurrenceDates(new Date("2026-07-07T19:00:00"), new Date("2026-07-10"), 1);
    expect(dates).toHaveLength(1);
  });

  it("includes an occurrence that falls on the end date itself", () => {
    const dates = occurrenceDates(new Date("2026-07-07T19:00:00"), new Date("2026-07-14"), 1);
    expect(dates).toHaveLength(2); // 7th and 14th
  });

  it("treats interval < 1 as weekly", () => {
    const dates = occurrenceDates(new Date("2026-07-07T19:00:00"), new Date("2026-07-21"), 0);
    expect(dates).toHaveLength(3);
  });
});
