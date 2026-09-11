import { test, expect } from "@playwright/test";
import { nextYear } from "./dates";

test("events page shows Upcoming tab active by default", async ({ page }) => {
  await page.goto("/events");
  const upcomingTab = page.getByRole("link", { name: "Upcoming" });
  await expect(upcomingTab).toHaveClass(/text-indigo-600/);
  await expect(page.getByRole("link", { name: "Past" })).not.toHaveClass(/text-indigo-600/);
});

test("switching to Past tab updates the URL and shows Past as active", async ({ page }) => {
  await page.goto("/events");
  await page.getByRole("link", { name: "Past" }).click();
  await expect(page).toHaveURL(/tab=past/);
  await expect(page.getByRole("link", { name: "Past" })).toHaveClass(/text-indigo-600/);
});

test("Past tab shows empty state when there are no past events", async ({ page }) => {
  await page.goto("/events?tab=past");
  await expect(page.getByText("No past events.")).toBeVisible();
});

test("Upcoming tab shows seeded future event", async ({ page }) => {
  await page.goto("/events");
  // Global setup seeds a Jun 1 event in next year — the year should appear,
  // since formatEventDate only prints it when it isn't the current year.
  await expect(page.getByText(new RegExp(String(nextYear()))).first()).toBeVisible();
});

test("Create Event button opens the modal", async ({ page }) => {
  await page.goto("/events");
  await page.getByRole("button", { name: "Create Event", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create an event" })).toBeVisible();
});

test("modal closes when the X button is clicked", async ({ page }) => {
  await page.goto("/events");
  await page.getByRole("button", { name: "Create Event", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("heading", { name: "Create an event" })).not.toBeVisible();
});

test("modal closes when the backdrop is clicked", async ({ page }) => {
  await page.goto("/events");
  await page.getByRole("button", { name: "Create Event", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create an event" })).toBeVisible();
  // Click the backdrop (top-left corner, outside the modal panel).
  await page.mouse.click(10, 10);
  await expect(page.getByRole("heading", { name: "Create an event" })).not.toBeVisible();
});

test("FAB opens the modal", async ({ page }) => {
  await page.goto("/events");
  await page.locator('[aria-label="Create event"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("switching back to Upcoming tab from Past restores Upcoming state", async ({ page }) => {
  await page.goto("/events?tab=past");
  await page.getByRole("link", { name: "Upcoming" }).click();
  await expect(page).toHaveURL(/tab=upcoming/);
  await expect(page.getByRole("link", { name: "Upcoming" })).toHaveClass(/text-indigo-600/);
});
