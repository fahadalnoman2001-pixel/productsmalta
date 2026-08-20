import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://productsinmalta.com";

  try {
    const [products, blogs, cats] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.blog.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true } })
    ]);

    return [
      { url: base, changeFrequency: "daily", priority: 1 },
      { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/about`, priority: 0.4 },
      { url: `${base}/contact`, priority: 0.4 },
      { url: `${base}/privacy`, priority: 0.2 },
      { url: `${base}/terms`, priority: 0.2 },
      ...cats.map((c) => ({ url: `${base}/products?category=${c.slug}`, priority: 0.7 })),
      ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
      ...blogs.map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: b.updatedAt, priority: 0.6 }))
    ];
  } catch (e) {
    return [
      { url: base, changeFrequency: "daily", priority: 1 },
      { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/about`, priority: 0.4 },
      { url: `${base}/contact`, priority: 0.4 },
      { url: `${base}/privacy`, priority: 0.2 },
      { url: `${base}/terms`, priority: 0.2 }
    ];
  }
}
