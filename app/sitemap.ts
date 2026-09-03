import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://clauseguard.vercel.app";

/**
 * Only the pages meant for a stranger to land on. /dashboard and /auth/* are
 * deliberately absent -- a sitemap is an invitation, and there is nothing to
 * invite a crawler to on an authenticated route.
 *
 * Inert while robots.ts disallows everything; written now so nobody has to
 * remember to build it the day the site actually goes live.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/sample`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
