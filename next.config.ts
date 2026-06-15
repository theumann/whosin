import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the data layer behind a clean API boundary (route handlers / server
  // actions) so the native-app door stays open — see CLAUDE.md.
};

export default nextConfig;
