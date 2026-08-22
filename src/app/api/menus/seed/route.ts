import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { showOnHomepage: true },
    orderBy: { order: "asc" },
    take: 6
  });

  type MenuItemSeed = {
    label: string;
    url: string;
    location: string;
    order: number;
    badge?: string | null;
    badgeColor?: string | null;
    isHighlighted?: boolean;
  };

  const topbarItems: MenuItemSeed[] = [
    { label: "Blog", url: "/blog", location: "topbar", order: 0 },
    { label: "About", url: "/about", location: "topbar", order: 1 },
    { label: "Contact", url: "/contact", location: "topbar", order: 2 }
  ];

  const mainItems: MenuItemSeed[] = [
    { label: "Home", url: "/", location: "main", order: 0 },
    { label: "All Products", url: "/products", location: "main", order: 1 },
    ...categories.map((c, idx) => ({
      label: c.name,
      url: `/products?category=${c.slug}`,
      location: "main",
      order: 2 + idx
    })),
    {
      label: "🔥 Weekend Sales",
      url: "/products?collection=weekend-sales",
      location: "main",
      order: 2 + categories.length,
      badge: "HOT",
      badgeColor: "red",
      isHighlighted: true
    }
  ];

  const allItems: MenuItemSeed[] = [...topbarItems, ...mainItems];

  // Delete existing if user requested a reset
  const body = await req.json().catch(() => ({}));
  if (body?.replace) {
    await prisma.menuItem.deleteMany({});
  }

  for (const item of allItems) {
    await prisma.menuItem.create({
      data: {
        label: item.label,
        url: item.url,
        location: item.location,
        order: item.order,
        badge: item.badge || null,
        badgeColor: item.badgeColor || null,
        isHighlighted: Boolean(item.isHighlighted),
        isActive: true
      }
    });
  }

  return NextResponse.json({ success: true, count: allItems.length });
}
