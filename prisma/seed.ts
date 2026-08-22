import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "fahad@gmail.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "TasminaBinte@19";

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed, name: "Super Admin", role: "super_admin" }
  });
  console.log(`Super admin: ${email}  /  ${password}`);

  const cats = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion",     slug: "fashion" },
    { name: "Home & Living", slug: "home-living" },
    { name: "Beauty",      slug: "beauty" },
    { name: "Sports",      slug: "sports" },
    { name: "Books",       slug: "books" }
  ];
  for (const [i, c] of cats.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, order: i, description: `${c.name} products & guides`, showOnHomepage: i < 3 }
    });
  }
  const electronics = await prisma.category.findUnique({ where: { slug: "electronics" } });
  const fashion = await prisma.category.findUnique({ where: { slug: "fashion" } });

  const subs = [
    { name: "Headphones", slug: "headphones", categoryId: electronics!.id },
    { name: "Smartphones", slug: "smartphones", categoryId: electronics!.id },
    { name: "Laptops", slug: "laptops", categoryId: electronics!.id },
    { name: "Men's Wear", slug: "mens-wear", categoryId: fashion!.id },
    { name: "Women's Wear", slug: "womens-wear", categoryId: fashion!.id }
  ];
  for (const s of subs) {
    await prisma.subcategory.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }

  const sampleImg = (seed: string) =>
    `https://picsum.photos/seed/${seed}/600/600`;

  const products = [
    { title: "Wireless Noise-Cancelling Headphones", brand: "SoundPro", price: 129.99, originalPrice: 199.99, cat: "electronics", sub: "headphones", featured: true, best: true, platform: "Amazon" },
    { title: "Smartphone 128GB Pro Max", brand: "TechX", price: 649, originalPrice: 799, cat: "electronics", sub: "smartphones", featured: true, best: false, platform: "Amazon" },
    { title: "Ultrabook 14\" 16GB RAM", brand: "NoteBookCo", price: 899, originalPrice: 1099, cat: "electronics", sub: "laptops", featured: false, best: true, platform: "eBay" },
    { title: "Men's Winter Jacket", brand: "NorthWear", price: 79.99, originalPrice: 129.99, cat: "fashion", sub: "mens-wear", featured: true, best: false, platform: "Amazon" },
    { title: "Women's Wool Sweater", brand: "CozyLife", price: 49.99, originalPrice: 69.99, cat: "fashion", sub: "womens-wear", featured: false, best: true, platform: "Amazon" },
    { title: "Espresso Coffee Machine", brand: "BrewMaster", price: 189, originalPrice: 249, cat: "home-living", sub: null, featured: true, best: true, platform: "Amazon" },
    { title: "Moisturizing Face Cream", brand: "GlowSkin", price: 24.99, originalPrice: 34.99, cat: "beauty", sub: null, featured: false, best: false, platform: "Amazon" },
    { title: "Yoga Mat Premium 6mm", brand: "FitCore", price: 29.99, originalPrice: 44.99, cat: "sports", sub: null, featured: true, best: false, platform: "Amazon" },
    { title: "Bestseller Novel: The Long Road", brand: "PenPress", price: 14.99, originalPrice: 19.99, cat: "books", sub: null, featured: false, best: true, platform: "Amazon" },
    { title: "Smartwatch Fitness Tracker", brand: "TechX", price: 99, originalPrice: 149, cat: "electronics", sub: null, featured: true, best: true, platform: "Amazon" },
    { title: "Wireless Bluetooth Speaker", brand: "SoundPro", price: 59, originalPrice: 89, cat: "electronics", sub: null, featured: false, best: false, platform: "Amazon" },
    { title: "Winter Boots Waterproof", brand: "NorthWear", price: 89, originalPrice: 129, cat: "fashion", sub: null, featured: true, best: false, platform: "Amazon" }
  ];

  for (const [i, p] of products.entries()) {
    const cat = await prisma.category.findUnique({ where: { slug: p.cat } });
    const sub = p.sub ? await prisma.subcategory.findUnique({ where: { slug: p.sub } }) : null;
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const images = JSON.stringify([
      sampleImg(`${slug}-1`), sampleImg(`${slug}-2`), sampleImg(`${slug}-3`), sampleImg(`${slug}-4`)
    ]);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        title: p.title, slug,
        description: `Premium ${p.title.toLowerCase()} from ${p.brand}. High quality product available on ${p.platform}. Perfect for daily use with amazing features and durability.`,
        shortDesc: `${p.brand} — top-rated pick`,
        images, price: p.price, originalPrice: p.originalPrice, currency: "EUR",
        brand: p.brand, platform: p.platform, affiliateUrl: "https://example.com/aff/" + slug,
        rating: 4 + Math.random(), reviewCount: 50 + Math.floor(Math.random() * 500),
        categoryId: cat?.id, subcategoryId: sub?.id,
        tags: JSON.stringify([p.brand.toLowerCase(), p.cat]),
        seoTitle: `${p.title} — Best Price in Malta`,
        seoDescription: `Buy ${p.title} by ${p.brand} online in Malta. Best deals & fast delivery.`,
        isFeatured: p.featured, isBestSeller: p.best
      }
    });
  }

  const collections = [
    { name: "Featured Products", slug: "featured", type: "featured" },
    { name: "Best Sellers", slug: "best-sellers", type: "bestseller" },
    { name: "Winter Collection", slug: "winter-collection", type: "seasonal" },
    { name: "Weekend Sales", slug: "weekend-sales", type: "seasonal" }
  ];
  for (const [i, c] of collections.entries()) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, order: i, description: `Handpicked ${c.name.toLowerCase()}`, showOnHomepage: c.type === "seasonal" }
    });
  }
  // Attach some products to winter/weekend collections
  const winter = await prisma.collection.findUnique({ where: { slug: "winter-collection" } });
  const weekend = await prisma.collection.findUnique({ where: { slug: "weekend-sales" } });
  const winterPicks = await prisma.product.findMany({
    where: { OR: [{ title: { contains: "Winter" } }, { title: { contains: "Jacket" } }, { title: { contains: "Sweater" } }, { title: { contains: "Boots" } }] }
  });
  for (const [i, p] of winterPicks.entries()) {
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: winter!.id, productId: p.id } },
      update: {},
      create: { collectionId: winter!.id, productId: p.id, order: i }
    });
  }
  const weekendPicks = await prisma.product.findMany({ take: 6, orderBy: { createdAt: "desc" } });
  for (const [i, p] of weekendPicks.entries()) {
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: weekend!.id, productId: p.id } },
      update: {},
      create: { collectionId: weekend!.id, productId: p.id, order: i }
    });
  }

  const banners = [
    { title: "Best Deals in Malta", subtitle: "Handpicked affiliate offers from top brands", image: "https://picsum.photos/seed/hero1/1600/600", link: "/products", slot: "hero", order: 0 },
    { title: "Winter Collection 2026", subtitle: "Stay warm, shop smart", image: "https://picsum.photos/seed/hero2/1600/600", link: "/products?collection=winter-collection", slot: "hero", order: 1 },
    { title: "Weekend Flash Sales", subtitle: "Up to 60% off — this weekend only", image: "https://picsum.photos/seed/hero3/1600/600", link: "/products?collection=weekend-sales", slot: "hero", order: 2 },
    { title: "Electronics Deals", image: "https://picsum.photos/seed/cat-electronics/800/400", link: "/products?category=electronics", slot: "category", slotKey: "electronics", order: 0 },
    { title: "Fashion Picks", image: "https://picsum.photos/seed/cat-fashion/800/400", link: "/products?category=fashion", slot: "category", slotKey: "fashion", order: 1 },
    // Promo strip (2-up under hero)
    { title: "Free Shipping", subtitle: "On orders over €50", image: "https://picsum.photos/seed/promo1/1600/220", link: "/products", slot: "promo", order: 0 },
    { title: "New Customer? Save 10%", subtitle: "Use code WELCOME10", image: "https://picsum.photos/seed/promo2/1600/220", link: "/products", slot: "promo", order: 1 },
    // Full-width middle banner between rows
    { title: "Summer Sale — Up to 60% Off", subtitle: "Handpicked deals across all categories", image: "https://picsum.photos/seed/middle1/1600/380", link: "/products?collection=weekend-sales", slot: "middle", order: 0 },
    // Double poster row (near the bottom of the homepage)
    { title: "Tech Deals", subtitle: "Laptops, phones & audio", image: "https://picsum.photos/seed/double1/800/450", link: "/products?category=electronics", slot: "double", order: 0 },
    { title: "Home & Living", subtitle: "Refresh your space", image: "https://picsum.photos/seed/double2/800/450", link: "/products?category=home-living", slot: "double", order: 1 },
    // Sidebar poster on /products
    { title: "Editor's Picks", subtitle: "Curated weekly", image: "https://picsum.photos/seed/sidebar1/600/800", link: "/products?featured=1", slot: "sidebar", order: 0 }
  ];
  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  const blogs = [
    { title: "Top 10 Wireless Headphones in 2026", slug: "top-10-wireless-headphones-2026", excerpt: "Our editor-tested picks for the best sound and comfort.", cat: "electronics", top: true },
    { title: "Winter Fashion Trends in Malta", slug: "winter-fashion-trends-malta", excerpt: "Cozy, stylish and Malta-weather-friendly outfits.", cat: "fashion", top: true },
    { title: "How to Choose the Right Laptop", slug: "how-to-choose-the-right-laptop", excerpt: "Buying guide for students, creators, and gamers.", cat: "electronics", top: false },
    { title: "5 Skincare Products Worth the Hype", slug: "5-skincare-products-worth-the-hype", excerpt: "Real reviews on trending beauty picks.", cat: "beauty", top: true }
  ];
  for (const b of blogs) {
    const cat = await prisma.category.findUnique({ where: { slug: b.cat } });
    await prisma.blog.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        title: b.title, slug: b.slug, excerpt: b.excerpt,
        content: `# ${b.title}\n\n${b.excerpt}\n\nThis is a sample blog post. Replace with rich content from the admin panel. It supports headings, paragraphs, images, and affiliate links.\n\n## Why it matters\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur venenatis, nisl in bib.\n\n## Our picks\n\n- Product one — great value\n- Product two — top performer\n- Product three — best budget option`,
        coverImage: `https://picsum.photos/seed/${b.slug}/1200/600`,
        categoryId: cat?.id, isTop: b.top,
        seoTitle: `${b.title} | Products in Malta`,
        seoDescription: b.excerpt,
        tags: JSON.stringify(["guide", b.cat])
      }
    });
  }

  const settings = [
    { key: "site_name", value: "Products in Malta" },
    { key: "site_tagline", value: "Curated affiliate deals & buying guides" },
    { key: "gsc_verification", value: "" },
    { key: "ga4_id", value: "G-LP8WYSQ3VG" },
    { key: "meta_pixel_id", value: "" },
    { key: "facebook_url", value: "https://facebook.com/" },
    { key: "instagram_url", value: "https://instagram.com/" },
    { key: "twitter_url", value: "https://twitter.com/" },
    { key: "youtube_url", value: "https://youtube.com/" },
    { key: "contact_email", value: "contact@productsinmalta.com" },
    { key: "contact_phone", value: "+356 0000 0000" }
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  // Persistent, no-expiry MCP token for the super admin
  const existing = await prisma.mCPToken.findFirst();
  if (!existing) {
    const token = "mcp_" + crypto.randomBytes(24).toString("hex");
    const admin = await prisma.user.findUnique({ where: { email } });
    await prisma.mCPToken.create({
      data: { name: "Default Super-Admin Token", token, createdBy: admin!.id }
    });
    console.log("MCP Token (save this):", token);
  }

  console.log("Seed complete.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
