// One-off: adds the new poster examples (promo, middle, double, sidebar) to
// an existing database. Safe to run more than once — it upserts by title+slot.
// Usage: npx tsx prisma/seed-banners.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const banners = [
  { title: "Free Shipping", subtitle: "On orders over €50", image: "https://picsum.photos/seed/promo1/1600/220", link: "/products", slot: "promo", order: 0 },
  { title: "New Customer? Save 10%", subtitle: "Use code WELCOME10", image: "https://picsum.photos/seed/promo2/1600/220", link: "/products", slot: "promo", order: 1 },
  { title: "Summer Sale — Up to 60% Off", subtitle: "Handpicked deals across all categories", image: "https://picsum.photos/seed/middle1/1600/380", link: "/products?collection=weekend-sales", slot: "middle", order: 0 },
  { title: "Tech Deals", subtitle: "Laptops, phones & audio", image: "https://picsum.photos/seed/double1/800/450", link: "/products?category=electronics", slot: "double", order: 0 },
  { title: "Home & Living", subtitle: "Refresh your space", image: "https://picsum.photos/seed/double2/800/450", link: "/products?category=home-living", slot: "double", order: 1 },
  { title: "Editor's Picks", subtitle: "Curated weekly", image: "https://picsum.photos/seed/sidebar1/600/800", link: "/products?featured=1", slot: "sidebar", order: 0 }
];

async function main() {
  for (const b of banners) {
    const exists = await prisma.banner.findFirst({ where: { title: b.title, slot: b.slot } });
    if (!exists) { await prisma.banner.create({ data: b }); console.log(`+ ${b.slot}: ${b.title}`); }
    else console.log(`= exists: ${b.slot}: ${b.title}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
