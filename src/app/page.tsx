import { prisma } from "@/lib/db";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductRow from "@/components/home/ProductRow";
import BlogRow from "@/components/home/BlogRow";
import PromoStrip from "@/components/home/PromoStrip";
import MiddleBanner from "@/components/home/MiddleBanner";
import DoubleBanner from "@/components/home/DoubleBanner";

export const dynamic = "force-dynamic";

async function getData() {
  const [heroBanners, catBanners, promoBanners, middleBanners, doubleBanners, categories, homeCollections, topBlogs, categoryRows] = await Promise.all([
    prisma.banner.findMany({ where: { slot: "hero", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "category", isActive: true } }),
    prisma.banner.findMany({ where: { slot: "promo", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "middle", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "double", isActive: true }, orderBy: { order: "asc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, take: 12 }),
    prisma.collection.findMany({
      where: { showOnHomepage: true, isActive: true },
      orderBy: { order: "asc" },
      include: { products: { include: { product: { include: { category: true } } }, orderBy: { order: "asc" } } }
    }),
    prisma.blog.findMany({ where: { isTop: true, isPublished: true }, include: { category: true }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({
      where: { showOnHomepage: true },
      orderBy: { order: "asc" },
      include: { products: { where: { isActive: true }, take: 10, orderBy: { createdAt: "desc" }, include: { category: true } } }
    })
  ]);
  return { heroBanners, catBanners, promoBanners, middleBanners, doubleBanners, categories, homeCollections, topBlogs, categoryRows };
}

async function productsForCollection(col: any) {
  if (col.type === "featured")
    return prisma.product.findMany({ where: { isFeatured: true, isActive: true }, include: { category: true }, take: 10, orderBy: { createdAt: "desc" } });
  if (col.type === "bestseller")
    return prisma.product.findMany({ where: { isBestSeller: true, isActive: true }, include: { category: true }, take: 10, orderBy: { clicks: "desc" } });
  return col.products.map((cp: any) => cp.product);
}

export default async function HomePage() {
  const d = await getData();
  const collectionRows = await Promise.all(d.homeCollections.map(async col => ({
    col, products: await productsForCollection(col)
  })));

  // Split rows in half; drop a middle banner in the middle if any exists.
  const mid = Math.ceil(collectionRows.length / 2);
  const topRows = collectionRows.slice(0, mid);
  const bottomRows = collectionRows.slice(mid);

  return (
    <>
      <HeroSlider banners={d.heroBanners} />
      <PromoStrip banners={d.promoBanners} />

      <section className="container-x pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { t: "Handpicked Deals", s: "Curated across Malta" },
            { t: "Best Prices", s: "Updated daily" },
            { t: "Trusted Brands", s: "Top platforms only" },
            { t: "Buy in 1 Click", s: "Direct affiliate links" }
          ].map(x => (
            <div key={x.t} className="bg-white rounded-lg border border-ink-100 px-4 py-3">
              <div className="text-sm font-bold text-ink-900">{x.t}</div>
              <div className="text-xs text-ink-400">{x.s}</div>
            </div>
          ))}
        </div>
      </section>

      <CategoryGrid categories={d.categories} banners={d.catBanners} />

      {topRows.map(({ col, products }) => (
        products.length > 0 && (
          <ProductRow
            key={col.id}
            title={col.type === "seasonal" ? `🔥 ${col.name}` : col.name}
            subtitle={col.description || undefined}
            products={products}
            viewAll={`/products?collection=${col.slug}`}
            accent={col.type === "seasonal"}
          />
        )
      ))}

      <MiddleBanner banner={d.middleBanners[0]} />

      {bottomRows.map(({ col, products }) => (
        products.length > 0 && (
          <ProductRow
            key={col.id}
            title={col.type === "seasonal" ? `🔥 ${col.name}` : col.name}
            subtitle={col.description || undefined}
            products={products}
            viewAll={`/products?collection=${col.slug}`}
            accent={col.type === "seasonal"}
          />
        )
      ))}

      <DoubleBanner banners={d.doubleBanners} />

      {d.categoryRows.map(c => (
        c.products.length > 0 && (
          <ProductRow key={c.id} title={c.name} subtitle={`Latest in ${c.name}`} products={c.products} viewAll={`/products?category=${c.slug}`} />
        )
      ))}

      <BlogRow blogs={d.topBlogs} />
    </>
  );
}
