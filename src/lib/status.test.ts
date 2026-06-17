import { describe, it, expect } from "vitest";
import { STATUS_LABELS, STATUS_ORDER, STATUS_COLORS } from "./status";

describe("status labels", () => {
  it("labels DEFAULT as 'Pending Answer' (never 'Default')", () => {
    expect(STATUS_LABELS.DEFAULT).toBe("Pending Answer");
  });

  it("has human labels for every status", () => {
    expect(STATUS_LABELS.IN).toBe("In");
    expect(STATUS_LABELS.WAITLIST).toBe("Wait List");
    expect(STATUS_LABELS.INJURY).toBe("Injury Reserve");
  });
});

describe("status order", () => {
  it("lists statuses In first, Pending Answer last", () => {
    expect(STATUS_ORDER).toEqual(["IN", "WAITLIST", "INJURY", "DEFAULT"]);
  });

  it("has a label and color for every ordered status", () => {
    for (const s of STATUS_ORDER) {
      expect(STATUS_LABELS[s]).toBeTruthy();
      expect(STATUS_COLORS[s]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
