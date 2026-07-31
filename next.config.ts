import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS folder. A stray package-lock.json in the
  // parent (C:\Users\tilt_\dev) was causing Next to pick the wrong root, which
  // mis-resolves build chunks (the "Cannot find module './570.js'" crash).
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },

  // Keep the data layer behind a clean API boundary (route handlers / server
  // actions) so the native-app door stays open — see CLAUDE.md.
};

export default withSentryConfig(nextConfig, {
  org: "theapps",
  project: "whos-in",

  // Uploading source maps needs a SENTRY_AUTH_TOKEN env var at build time
  // (Railway build environment); without it the plugin just skips the upload.
  silent: !process.env.CI,

  // Removes source maps from the client bundle after uploading them to
  // Sentry, so they aren't shipped to browsers.
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  webpack: { treeshake: { removeDebugLogging: true } },
});
