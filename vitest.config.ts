import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure lib/ logic — no DOM needed.
    environment: "node",
    // Pin the timezone so date formatting in messages.ts is deterministic
    // across machines/CI.
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      // Report against all source so untested areas show honestly as gaps.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        // Infra / framework glue, not unit-testable (covered by integration or
        // E2E later) — excluding keeps the signal on actual logic.
        "src/lib/db.ts",
        "src/app/**/layout.tsx",
        "src/app/**/route.ts",
      ],
      // No failing thresholds yet — add per-directory thresholds (e.g. lib/)
      // once the suite stabilizes. Example:
      // thresholds: { "src/lib/**": { lines: 90, functions: 90 } },
    },
  },
});
