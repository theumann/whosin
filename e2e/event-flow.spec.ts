import { test, expect } from "@playwright/test";
import { dateTimeValue, daysFromNow } from "./dates";

// The product's spine: create an event, mark a player In, confirm the capacity
// indicator and the WhatsApp message both reflect it.
test("create event, mark a player In, see it reflected in the WhatsApp message", async ({
  page,
}) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();

  // Open the create event modal.
  await page.getByRole("button", { name: "Create Event", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create an event" })).toBeVisible();

  // Create an event (capacity 10).
  // Must stay in the future: specs share one DB within a run, and
  // events-page.spec asserts the Past tab is empty.
  await page.locator('input[name="startsAt"]').fill(dateTimeValue(daysFromNow(30)));
  await page.locator('input[name="capacity"]').fill("10");
  await page.getByRole("dialog").getByRole("button", { name: "Create event" }).click();

  // Lands on the event status screen.
  await page.waitForURL(/\/events\/.+/);

  // Mark Alpha "In".
  const alphaRow = page.locator("li").filter({ hasText: "Alpha" }).first();
  await alphaRow.locator("select[name='status']").selectOption("IN");

  // Capacity indicator updates to 1 / 10.
  await expect(page.getByText(/1\s*\/\s*10 in/)).toBeVisible();

  // The WhatsApp composer reflects the In player.
  const textarea = page.locator("textarea");
  await expect(textarea).toHaveValue(/✅ In \(1\/10\)/);
  await expect(textarea).toHaveValue(/Alpha/);

  // Pending players must NOT appear in the broadcast.
  await expect(textarea).not.toHaveValue(/Pending Answer/);
});
