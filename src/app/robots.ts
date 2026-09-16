import type { MetadataRoute } from "next";

// Only the public pages are worth indexing; everything else is behind sign-in
// and would just redirect crawlers to /login.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/$", "/login", "/privacy", "/terms"],
      disallow: "/",
    },
  };
}
