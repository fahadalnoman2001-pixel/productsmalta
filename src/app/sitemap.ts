import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://youroffers.eu";
  const now = new Date();

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
        where: { showOnHomepage: true },
        select: { slug: true }
      })
    ]);

    return [
      // Core pages
      { url: base, changeFrequency: "daily", priority: 1.0, lastModified: now },
      { url: `${base}/products`, changeFrequency: "daily", priority: 0.9, lastModified: now },
      { url: `${base}/blog`, changeFrequency: "daily", priority: 0.8, lastModified: now },
      { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },

      // Category pages (once you migrate to /category/[slug] path)
      ...cats.map((c) => ({
        url: `${base}/category/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
        lastModified: now
      })),

      // Collections
      ...collections.map((c) => ({
        url: `${base}/collection/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        lastModified: now
      })),

      // Products — highest volume
      ...products.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7
      })),

      // Blog posts
      ...blogs.map((b) => ({
        url: `${base}/blog/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6
      }))
    ];
  } catch (e) {
    return [
      { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
      { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 }
    ];
  }
}
