import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const ROUTES = ["/", "/about", "/contacts", "/privacy", "/terms", "/photo-policy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
