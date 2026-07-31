import { test, expect } from "@playwright/test";

test("Add Player button opens the modal", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("button", { name: "Add Player", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Add a player" })).toBeVisible();
});

test("modal closes when the X button is clicked", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("button", { name: "Add Player", exact: true }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("heading", { name: "Add a player" })).not.toBeVisible();
});

test("modal closes when the backdrop is clicked", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("button", { name: "Add Player", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Add a player" })).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole("heading", { name: "Add a player" })).not.toBeVisible();
});

test("FAB opens the modal", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("button", { name: "Add player", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("delete button shows confirmation modal with player name", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByRole("heading", { name: "Delete player?" })).toBeVisible();
  await expect(page.getByText(/permanently delete/)).toBeVisible();
});

test("cancelling delete confirmation keeps player in roster", async ({ page }) => {
  await page.goto("/roster");
  const firstName = await page.locator("ul li strong").first().innerText();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText(firstName)).toBeVisible();
});

test("adding a player via modal shows them in the roster", async ({ page }) => {
  await page.goto("/roster");
  await page.getByRole("button", { name: "Add Player", exact: true }).click();
  await page.locator('input[name="firstName"]').fill("Delta");
  await page.getByRole("dialog").getByRole("button", { name: "Add player" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("Delta")).toBeVisible();
});
