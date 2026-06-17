import { describe, it, expect } from "vitest";
import type { EntryStatus, Squad } from "@prisma/client";
import {
  buildHeader,
  buildRosterBody,
  buildSquadBody,
  buildCanceledMessage,
  whatsappShareUrl,
  type EventMessageData,
} from "./messages";

// Helper to build entries concisely.
function entry(firstName: string, status: EntryStatus, squad: Squad | null = null) {
  return { status, squad, player: { firstName, lastName: null } };
}

const base: EventMessageData = {
  groupName: "Thursday Night Soccer",
  // 19:00 UTC — TZ is pinned to UTC in vitest.setup.ts.
  startsAt: new Date("2026-06-25T19:00:00Z"),
  location: "Riverside Park",
  capacity: 16,
  entries: [],
};

describe("buildHeader", () => {
  it("includes group, formatted date, and location", () => {
    expect(buildHeader(base)).toBe(
      "Thursday Night Soccer — Thu, Jun 25, 7:00 PM @ Riverside Park",
    );
  });

  it("omits the location separator when there is no location", () => {
    const h = buildHeader({ ...base, location: null });
    expect(h).toBe("Thursday Night Soccer — Thu, Jun 25, 7:00 PM");
    expect(h).not.toContain("@");
  });
});

describe("buildRosterBody", () => {
  it("groups In / Wait List / Injury Reserve and hides Pending Answer", () => {
    const body = buildRosterBody({
      ...base,
      entries: [
        entry("Marco", "IN"),
        entry("James", "IN"),
        entry("Tom", "WAITLIST"),
        entry("Sam", "INJURY"),
        entry("Ghost", "DEFAULT"), // must NOT appear
      ],
    });
    expect(body).toContain("✅ In (2/16):");
    expect(body).toContain("• Marco");
    expect(body).toContain("⏳ Wait List (1):");
    expect(body).toContain("🩹 Injury Reserve (1):");
    expect(body).not.toContain("Ghost");
    expect(body).not.toContain("Pending");
  });

  it("omits capacity in the In line when capacity is null", () => {
    const body = buildRosterBody({
      ...base,
      capacity: null,
      entries: [entry("Marco", "IN")],
    });
    expect(body).toContain("✅ In (1):");
    expect(body).not.toContain("/");
  });

  it("skips empty sections", () => {
    const body = buildRosterBody({ ...base, entries: [entry("Marco", "IN")] });
    expect(body).toContain("In (1/16)");
    expect(body).not.toContain("Wait List");
    expect(body).not.toContain("Injury Reserve");
  });

  it("uses full name when a last name is present", () => {
    const body = buildRosterBody({
      ...base,
      entries: [{ status: "IN", squad: null, player: { firstName: "Marco", lastName: "Rossi" } }],
    });
    expect(body).toContain("• Marco Rossi");
  });
});

describe("buildSquadBody", () => {
  it("returns empty string when no split has been done", () => {
    const body = buildSquadBody({
      ...base,
      entries: [entry("Marco", "IN"), entry("James", "IN")],
    });
    expect(body).toBe("");
  });

  it("builds Team A and Team B from assigned In players", () => {
    const body = buildSquadBody({
      ...base,
      entries: [
        entry("Marco", "IN", "A"),
        entry("James", "IN", "A"),
        entry("Tom", "IN", "B"),
      ],
    });
    expect(body).toContain("🅰️ Team A (2):");
    expect(body).toContain("• Marco");
    expect(body).toContain("🅱️ Team B (1):");
    expect(body).toContain("• Tom");
  });

  it("ignores assigned players who are not In", () => {
    const body = buildSquadBody({
      ...base,
      entries: [
        entry("Marco", "IN", "A"),
        entry("Benched", "WAITLIST", "B"), // assigned but not In
      ],
    });
    expect(body).toContain("Team A (1)");
    expect(body).not.toContain("Benched");
    expect(body).not.toContain("Team B");
  });
});

describe("buildCanceledMessage", () => {
  it("includes the header and a CANCELED notice", () => {
    const msg = buildCanceledMessage(base);
    expect(msg).toContain("Thursday Night Soccer");
    expect(msg).toContain("CANCELED");
  });
});

describe("whatsappShareUrl", () => {
  it("URL-encodes the message into a wa.me link", () => {
    expect(whatsappShareUrl("Hi there & welcome")).toBe(
      "https://wa.me/?text=Hi%20there%20%26%20welcome",
    );
  });
});
