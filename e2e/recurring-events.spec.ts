import { test, expect } from "@playwright/test";

// Recurring events: creating a weekly series materializes every occurrence and
// each shows the recurring indicator in the list.
test("create a weekly recurring series and see all occurrences", async ({ page }) => {
  await page.goto("/events");

  // Open the create event modal.
  await page.getByRole("button", { name: "Create Event", exact: true }).click();

  // First occurrence: Tue Sep 1, 2026 @ 7pm.
  await page.locator('input[name="startsAt"]').fill("2026-09-01T19:00");

  // Turn on weekly repetition until Sep 22 → Sep 1, 8, 15, 22 = 4 occurrences.
  await page.getByLabel(/Repeat this event/).check();
  await page.locator('input[name="intervalWeeks"]').fill("1");
  await page.locator('input[name="endDate"]').fill("2026-09-22");

  await page.getByRole("dialog").getByRole("button", { name: "Create event" }).click();

  // Back on the events list, all four occurrences carry the recurring indicator.
  await expect(page.getByTitle("Part of a recurring series")).toHaveCount(4);
});
