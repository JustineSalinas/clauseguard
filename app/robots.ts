import type { MetadataRoute } from "next";

/**
 * Mirrors the `robots: { index: false }` in layout.tsx metadata. That tag
 * covers pages a crawler already fetched; this file stops one from fetching
 * `/dashboard` or `/auth/*` in the first place. Both need updating together
 * when the site goes live -- this file, and the `index: false` in
 * app/layout.tsx metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
