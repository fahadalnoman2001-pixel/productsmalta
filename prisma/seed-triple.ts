// One-off: seed the 3 sample "triple" posters that used to be hardcoded.
// Safe to run multiple times — upserts by (title + slot).
// Usage on the VPS:
//   cd /var/www/productsmalta && npx tsx prisma/seed-triple.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const banners = [
  {
    title: "Smart Tech & Gadgets",
    subtitle: "Up to 45% off top-rated gear",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    link: "/products?category=electronics",
    slot: "triple",
    slotKey: "Trending Deals", // <-- shown as orange badge pill
    order: 0
  },
  {
    title: "Home & Modern Living",
    subtitle: "Upgrade your space with top picks",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
    link: "/products?category=home-living",
    slot: "triple",
    slotKey: "Special Selection",
    order: 1
  },
  {
    title: "Style & Lifestyle Essentials",
    subtitle: "Curated fashion & accessories",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    link: "/products?category=fashion",
    slot: "triple",
    slotKey: "Hot Offers",
    order: 2
  }
];

async function main() {
  for (const b of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title, slot: b.slot } });
    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data: b });
      console.log(`~ updated: ${b.title}`);
    } else {
      await prisma.banner.create({ data: b });
      console.log(`+ created: ${b.title}`);
    }
  }
  console.log("Done. Refresh the homepage — the three posters now come from the DB.");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
