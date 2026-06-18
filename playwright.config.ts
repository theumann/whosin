import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

// E2E config. Spins up the dev server, runs a global setup that creates an
// isolated E2E coach + roster and an authenticated session (so tests skip the
// magic-link UI), then runs specs against http://localhost:3000.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  fullyParallel: false,
  // One worker: E2E specs share a single DB-backed E2E group, so run serially
  // to avoid cross-test interference.
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    storageState: "./e2e/.auth/state.json",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
