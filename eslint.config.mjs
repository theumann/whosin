import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // Next.js correctness rules + TypeScript. "prettier" (eslint-config-prettier)
  // MUST come last — it disables ESLint's formatting rules so Prettier owns
  // formatting and ESLint owns code quality. They complement, not overlap.
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "e2e/.auth/**",
    ],
  },
];

export default eslintConfig;
