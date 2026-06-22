import { describe, expect, it } from "vitest";
import { isRateLimited } from "./rateLimit";

describe("isRateLimited", () => {
  it("allows a first request with no prior timestamp", () => {
    expect(isRateLimited(undefined, 1000, 60_000)).toBe(false);
  });

  it("blocks a request within the cooldown window", () => {
    expect(isRateLimited(1000, 1000 + 30_000, 60_000)).toBe(true);
  });

  it("allows a request once the cooldown has elapsed", () => {
    expect(isRateLimited(1000, 1000 + 60_000, 60_000)).toBe(false);
  });
});
