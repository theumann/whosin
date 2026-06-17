import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure lib/ logic — no DOM needed.
    environment: "node",
    // Pin the timezone so date formatting in messages.ts is deterministic
    // across machines/CI.
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
  },
});
