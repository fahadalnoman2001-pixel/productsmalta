import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SUPPORTED_LOCALES, getAlternateLanguageUrls, getLocalizedPath } from "@/lib/i18n/config";

// Cache sitemap for 24 hours (86,400 seconds)
export const revalidate = 86400;

// Stable fixed timestamp for static pages (allows Next.js to reliably cache the sitemap output)
const STATIC_LASTMOD = new Date("2026-08-23T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL || "https://youroffers.eu").replace(/\/+$/, "");

  // Helper to build 4 locale entries for each route
  function buildLocalizedEntries(
    path: string,
    options: {
      changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
      priority: number;
      lastModified?: Date;
    }
  ) {
    const alternates = {
      languages: getAlternateLanguageUrls(path, base)
    };

    return SUPPORTED_LOCALES.map(loc => {
      const locPath = getLocalizedPath(path, loc);
      const url =
        loc === "en" && path === "/"
          ? `${base}/`
          : `${base}${locPath === "/" ? "" : locPath}`;

      return {
        url,
        changeFrequency: options.changeFrequency,
        priority: loc === "en" ? options.priority : Math.max(0.1, options.priority - 0.05),
        lastModified: options.lastModified || STATIC_LASTMOD,
        alternates
      };
    });
  }

  try {
    const [products, blogs, cats, collections] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.blog.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.collection.findMany({
        where: { showOnHomepage: true, isActive: true },
        select: { slug: true }
      })
    ]);

    const sitemapItems: MetadataRoute.Sitemap = [
      // Core static pages across all 4 locales (with fixed stable lastModified)
      ...buildLocalizedEntries("/", { changeFrequency: "daily", priority: 1.0 }),
      ...buildLocalizedEntries("/products", { changeFrequency: "daily", priority: 0.9 }),
      ...buildLocalizedEntries("/blog", { changeFrequency: "daily", priority: 0.8 }),
      ...buildLocalizedEntries("/about", { changeFrequency: "monthly", priority: 0.5 }),
      ...buildLocalizedEntries("/contact", { changeFrequency: "monthly", priority: 0.5 }),
      ...buildLocalizedEntries("/privacy", { changeFrequency: "yearly", priority: 0.2 }),
      ...buildLocalizedEntries("/terms", { changeFrequency: "yearly", priority: 0.2 }),

      // Categories across all 4 locales
      ...cats.flatMap(c =>
        buildLocalizedEntries(`/category/${c.slug}`, {
          changeFrequency: "daily",
          priority: 0.8
        })
      ),

      // Collections across all 4 locales
      ...collections.flatMap(c =>
        buildLocalizedEntries(`/collection/${c.slug}`, {
          changeFrequency: "weekly",
          priority: 0.7
        })
      ),

      // Products across all 4 locales (with real record updatedAt)
      ...products.flatMap(p =>
        buildLocalizedEntries(`/products/${p.slug}`, {
          changeFrequency: "weekly",
          priority: 0.7,
          lastModified: p.updatedAt || STATIC_LASTMOD
        })
      ),

      // Blog posts across all 4 locales (with real record updatedAt)
      ...blogs.flatMap(b =>
        buildLocalizedEntries(`/blog/${b.slug}`, {
          changeFrequency: "monthly",
          priority: 0.6,
          lastModified: b.updatedAt || STATIC_LASTMOD
        })
      )
    ];

    return sitemapItems;
  } catch (e) {
    // Robust fallback: Return core static pages if database query times out or fails
    return [
      ...buildLocalizedEntries("/", { changeFrequency: "daily", priority: 1.0 }),
      ...buildLocalizedEntries("/products", { changeFrequency: "daily", priority: 0.9 }),
      ...buildLocalizedEntries("/blog", { changeFrequency: "daily", priority: 0.8 }),
      ...buildLocalizedEntries("/about", { changeFrequency: "monthly", priority: 0.5 }),
      ...buildLocalizedEntries("/contact", { changeFrequency: "monthly", priority: 0.5 }),
      ...buildLocalizedEntries("/privacy", { changeFrequency: "yearly", priority: 0.2 }),
      ...buildLocalizedEntries("/terms", { changeFrequency: "yearly", priority: 0.2 })
    ];
  }
}
