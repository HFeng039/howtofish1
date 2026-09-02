import type { MetadataRoute } from "next";

import categoryData from "@/content/categories.json";
import postData from "@/content/posts.json";
import { localeIds } from "@/i18n/routing";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"
).replace(/\/$/, "");

function url(locale: string, path: string) {
  return `${baseUrl}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return localeIds.flatMap((locale) => [
    {
      url: url(locale, ""),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: url(locale, "/guides"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryData.map((category) => ({
      url: url(locale, `/${category.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...postData.map((post) => ({
      url: url(locale, `/guides/${post.slug}`),
      lastModified: new Date(post.updated),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ]);
}
