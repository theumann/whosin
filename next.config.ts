import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS folder. A stray package-lock.json in the
  // parent (C:\Users\tilt_\dev) was causing Next to pick the wrong root, which
  // mis-resolves build chunks (the "Cannot find module './570.js'" crash).
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },

  // Keep the data layer behind a clean API boundary (route handlers / server
  // actions) so the native-app door stays open — see CLAUDE.md.
};

export default nextConfig;
