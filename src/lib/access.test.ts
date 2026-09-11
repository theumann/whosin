import { describe, expect, it } from "vitest";
import { ACCESS_EMAIL, accessRequestMailto } from "./access";

describe("accessRequestMailto", () => {
  it("targets the access alias by default", () => {
    expect(accessRequestMailto()).toMatch(/^mailto:access@whosin\.team\?/);
    expect(ACCESS_EMAIL).toBe("access@whosin.team");
  });

  it("encodes the subject and body so spaces and newlines survive", () => {
    const url = accessRequestMailto();
    expect(url).toContain("subject=whosIn%20access%20request");
    expect(url).toContain("%0A"); // newlines, not raw breaks
    expect(url).not.toMatch(/\s/);
  });

  it("prompts for the details needed to action the request", () => {
    const body = decodeURIComponent(new URL(accessRequestMailto()).search);
    expect(body).toContain("Email to allow:");
    expect(body).toContain("Name:");
    expect(body).toContain("Group / team:");
  });

  it("accepts an override address", () => {
    expect(accessRequestMailto("other@example.com")).toMatch(/^mailto:other@example\.com\?/);
  });
});
