import { test, expect } from "@playwright/test";

test("logo on events page links to home", async ({ page }) => {
  await page.goto("/events");
  await page.getByRole("img", { name: "whosIn" }).click();
  await expect(page).toHaveURL("/");
});

test("logo on roster page links to home", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("img", { name: "whosIn" }).click();
  await expect(page).toHaveURL("/");
});

test("pencil icon on home page event row points to the event detail page", async ({ page }) => {
  await page.goto("/");
  // Global setup seeds a future event — it should appear in the upcoming list.
  const pencil = page.getByRole("link", { name: "View event" }).first();
  await expect(pencil).toBeVisible();
  const href = await pencil.getAttribute("href");
  expect(href).toMatch(/\/events\/.+/);
});

test("event row on home page links to the event detail page", async ({ page }) => {
  await page.goto("/");
  const row = page.locator("ul li a").first();
  await expect(row).toBeVisible();
  const href = await row.getAttribute("href");
  expect(href).toMatch(/\/events\/.+/);
});
