import { describe, it, expect } from "vitest";
import { formatEventDate } from "./dateFormat";

// TZ is pinned to UTC in vitest.setup.ts.

describe("formatEventDate", () => {
  it("omits the year when the event is in the current year", () => {
    const date = new Date("2026-08-15T19:00:00Z");
    const result = formatEventDate(date, 2026);
    expect(result).not.toMatch(/2026/);
    expect(result).toMatch(/Aug 15/);
  });

  it("includes the year when the event is in a future year", () => {
    const date = new Date("2027-01-10T19:00:00Z");
    const result = formatEventDate(date, 2026);
    expect(result).toMatch(/2027/);
    expect(result).toMatch(/Jan 10/);
  });

  it("includes the year when the event is in a past year", () => {
    const date = new Date("2025-03-20T19:00:00Z");
    const result = formatEventDate(date, 2026);
    expect(result).toMatch(/2025/);
  });
});
