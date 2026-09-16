import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

// Content-Security-Policy. Shipped as **Report-Only** first: a CSP mistake
// breaks the app silently for real users, and a report-only header surfaces
// violations in the browser console without blocking anything. Promote it to
// the enforcing `Content-Security-Policy` key once the console is quiet.
//
// 'unsafe-inline' in script-src is required, not sloppiness: Next injects
// inline bootstrap and hydration scripts, and the nonce-based alternative
// needs middleware to stamp a per-request nonce — which this app deliberately
// doesn't have. 'unsafe-eval' is dev-only (React Fast Refresh).
//
// The app loads no external scripts, styles, fonts or images: next/font
// self-hosts Inter at build time, so 'self' covers everything. The only
// client-side egress is Sentry's ingest endpoint — wildcarded across
// *.sentry.io because the DSN's host is org- and region-specific (e.g.
// o123.ingest.us.sentry.io) and isn't knowable from the repo. api.resend.com is called
// server-side (CSP doesn't apply) and api.whatsapp.com is a link target, not
// a fetch.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.sentry.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // `upgrade-insecure-requests` is deliberately absent: browsers ignore it in
  // a report-only policy and warn about it on every page load. Add it when
  // this is promoted to the enforcing header (HSTS already covers the domain).
].join("; ");

const securityHeaders = [
  // One year, subdomains included. Deliberately NO `preload`: that submits the
  // domain to a browser-baked list that is slow and awkward to reverse.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // The app is never framed, and its delete/cancel actions are one-click form
  // posts — the clickjacking target worth closing. Enforced (unlike
  // frame-ancestors above, which is only reporting while the CSP is).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS folder. A stray package-lock.json in the
  // parent (C:\Users\tilt_\dev) was causing Next to pick the wrong root, which
  // mis-resolves build chunks (the "Cannot find module './570.js'" crash).
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },

  // Don't advertise the framework in an `x-powered-by` response header.
  poweredByHeader: false,

  // Keep the data layer behind a clean API boundary (route handlers / server
  // actions) so the native-app door stays open — see CLAUDE.md.

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
