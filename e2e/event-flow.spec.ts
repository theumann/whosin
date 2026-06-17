import { test, expect } from "@playwright/test";

// The product's spine: create an event, mark a player In, confirm the capacity
// indicator and the WhatsApp message both reflect it.
test("create event, mark a player In, see it reflected in the WhatsApp message", async ({
  page,
}) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();

  // Create an event (capacity 10).
  await page.locator('input[name="startsAt"]').fill("2026-07-15T19:00");
  await page.locator('input[name="capacity"]').fill("10");
  await page.getByRole("button", { name: "Create event" }).click();

  // Lands on the event status screen.
  await page.waitForURL(/\/events\/.+/);

  // Mark Alpha "In".
  const alphaRow = page.locator("li").filter({ hasText: "Alpha" }).first();
  await alphaRow.getByRole("button", { name: "In", exact: true }).click();

  // Capacity indicator updates to 1 / 10.
  await expect(page.getByText(/1\s*\/\s*10 in/)).toBeVisible();

  // The WhatsApp composer reflects the In player.
  const textarea = page.locator("textarea");
  await expect(textarea).toHaveValue(/✅ In \(1\/10\)/);
  await expect(textarea).toHaveValue(/Alpha/);

  // Pending players must NOT appear in the broadcast.
  await expect(textarea).not.toHaveValue(/Pending Answer/);
});
