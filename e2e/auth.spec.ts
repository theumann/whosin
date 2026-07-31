import { test, expect, type BrowserContext } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

async function injectSession(context: BrowserContext): Promise<void> {
  const db = new PrismaClient();
  try {
    const user = await db.user.findUniqueOrThrow({ where: { email: "e2e-coach@example.com" } });
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await db.session.create({ data: { sessionToken, userId: user.id, expires } });
    await context.addCookies([
      {
        name: "authjs.session-token",
        value: sessionToken,
        domain: "localhost",
        path: "/",
        expires: Math.floor(expires.getTime() / 1000),
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
  } finally {
    await db.$disconnect();
  }
}

// Run without the pre-seeded auth cookie so we can test unauthenticated access.
test.use({ storageState: { cookies: [], origins: [] } });

const protectedRoutes = ["/", "/events", "/roster"];

for (const route of protectedRoutes) {
  test(`unauthenticated visit to ${route} redirects to /login`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  });
}

test("visiting /login while logged out shows the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send magic link" })).toBeVisible();
});

test("valid session lands on the home page", async ({ page, context }) => {
  await injectSession(context);
  await page.goto("/");
  await expect(page).toHaveURL("/");
});
