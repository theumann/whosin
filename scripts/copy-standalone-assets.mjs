// Runs after `next build`. With `output: "standalone"`, Next writes a minimal
// server to .next/standalone but deliberately leaves out `public/` and
// `.next/static/` (it expects a CDN to serve them). We serve them from the same
// server, so copy them in — without this, pages load with no CSS, JS or icons.
import { cpSync, existsSync } from "node:fs";

const standalone = ".next/standalone";
if (!existsSync(standalone)) {
  console.error(`${standalone} is missing — is output: "standalone" set in next.config.ts?`);
  process.exit(1);
}

cpSync("public", `${standalone}/public`, { recursive: true });
cpSync(".next/static", `${standalone}/.next/static`, { recursive: true });
