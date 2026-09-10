import { describe, expect, it } from "vitest";
import { isEmailAllowed, parseAllowlist } from "./allowlist";

describe("parseAllowlist", () => {
  it("returns an empty list when unset", () => {
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(parseAllowlist("")).toEqual([]);
  });

  it("trims, lowercases, and drops empty entries", () => {
    expect(parseAllowlist(" Coach@Example.com , ,b@x.io ")).toEqual([
      "coach@example.com",
      "b@x.io",
    ]);
  });
});

describe("isEmailAllowed", () => {
  const list = ["coach@example.com"];

  it("allows a listed address regardless of case or padding", () => {
    expect(isEmailAllowed(" Coach@Example.COM ", list, true)).toBe(true);
  });

  it("blocks an unlisted address", () => {
    expect(isEmailAllowed("stranger@example.com", list, true)).toBe(false);
  });

  it("blocks a missing address", () => {
    expect(isEmailAllowed(null, list, false)).toBe(false);
    expect(isEmailAllowed("   ", list, false)).toBe(false);
  });

  it("fails closed in production when the allowlist is unset", () => {
    expect(isEmailAllowed("anyone@example.com", [], true)).toBe(false);
  });

  it("stays open outside production when the allowlist is unset", () => {
    expect(isEmailAllowed("anyone@example.com", [], false)).toBe(true);
  });
});
