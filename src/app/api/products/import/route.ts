import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parse } from "csv-parse/sync";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const text = await req.text();
  const rows = parse(text, { columns: true, skip_empty_lines: true, trim: true });
  const errors: string[] = []; let imported = 0;
  for (const row of rows as any[]) {
    try {
      const cat = row.categorySlug ? await prisma.category.findUnique({ where: { slug: row.categorySlug } }) : null;
      await prisma.product.upsert({
        where: { slug: row.slug || slugify(row.title) },
        update: {},
        create: {
          title: row.title, slug: row.slug || slugify(row.title),
          description: row.description || row.title, shortDesc: row.shortDesc,
          images: JSON.stringify((row.imageUrl || "").split("|").filter(Boolean)),
          price: parseFloat(row.price) || 0,
          originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
          currency: row.currency || "EUR",
          brand: row.brand, platform: row.platform,
          affiliateUrl: row.affiliateUrl,
          rating: parseFloat(row.rating) || 4.5,
          reviewCount: parseInt(row.reviewCount) || 100,
          categoryId: cat?.id,
          tags: JSON.stringify((row.tags || "").split("|").filter(Boolean)),
          isFeatured: row.isFeatured === "true", isBestSeller: row.isBestSeller === "true"
        }
      });
      imported++;
    } catch (e: any) { errors.push(`${row.title}: ${e.message}`); }
  }
  return NextResponse.json({ imported, errors });
}
