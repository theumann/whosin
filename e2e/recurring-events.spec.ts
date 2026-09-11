import { test, expect } from "@playwright/test";
import { dateTimeValue, dateValue, daysFromNow } from "./dates";

// Recurring events: creating a weekly series materializes every occurrence and
// each shows the recurring indicator in the list.
//
// Dates are computed relative to today, never hard-coded. An earlier version of
// this spec pinned Sep 1-22 2026; it passed until the calendar caught up, then
// failed permanently because the first two occurrences had moved into the past
// and dropped off the "Upcoming" tab. A date-relative spec cannot expire.

test("create a weekly recurring series and see all occurrences", async ({ page }) => {
  // First occurrence a week out at 7pm, so every occurrence stays in the
  // future and therefore on the Upcoming tab.
  const first = daysFromNow(7);

  // Three more weekly steps → 4 occurrences. The end date is inclusive to the
  // end of that day (see occurrenceDates), so a 7pm occurrence on it counts.
  const end = new Date(first);
  end.setDate(end.getDate() + 21);

  await page.goto("/events");

  // Open the create event modal.
  await page.getByRole("button", { name: "Create Event", exact: true }).click();

  await page.locator('input[name="startsAt"]').fill(dateTimeValue(first));

  // Turn on weekly repetition until the end date.
  await page.getByLabel(/Repeat this event/).check();
  await page.locator('input[name="intervalWeeks"]').fill("1");
  await page.locator('input[name="endDate"]').fill(dateValue(end));

  await page.getByRole("dialog").getByRole("button", { name: "Create event" }).click();

  // Back on the events list, all four occurrences carry the recurring indicator.
  await expect(page.getByTitle("Part of a recurring series")).toHaveCount(4);
});
