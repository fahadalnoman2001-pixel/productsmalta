import { prisma } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import ProductSort from "@/components/product/ProductSort";
import SidebarPoster from "@/components/SidebarPoster";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "All Products — Best Affiliate Deals in Malta" };

export default async function ProductsPage({ searchParams }: { searchParams: Record<string,string> }) {
  const q = searchParams.q?.toLowerCase();
  const categorySlug = searchParams.category;
  const brand = searchParams.brand;
  const platform = searchParams.platform;
  const collectionSlug = searchParams.collection;
  const featured = searchParams.featured === "1";
  const best = searchParams.best === "1";
  const minPrice = searchParams.min ? parseFloat(searchParams.min) : undefined;
  const maxPrice = searchParams.max ? parseFloat(searchParams.max) : undefined;
  const rating = searchParams.rating ? parseFloat(searchParams.rating) : undefined;
  const sort = searchParams.sort || "new";

  const where: any = { isActive: true };
  if (q) where.OR = [{ title: { contains: q } }, { description: { contains: q } }, { brand: { contains: q } }];
  if (brand) where.brand = brand;
  if (platform) where.platform = platform;
  if (featured) where.isFeatured = true;
  if (best) where.isBestSeller = true;
  if (minPrice != null) where.price = { ...(where.price || {}), gte: minPrice };
  if (maxPrice != null) where.price = { ...(where.price || {}), lte: maxPrice };
  if (rating != null) where.rating = { gte: rating };

  let activeCategory: any = null;
  if (categorySlug) {
    activeCategory = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (activeCategory) where.categoryId = activeCategory.id;
  }
  let activeCollection: any = null;
  if (collectionSlug) {
    activeCollection = await prisma.collection.findUnique({ where: { slug: collectionSlug }, include: { products: true } });
    if (activeCollection) {
      if (activeCollection.type === "featured") where.isFeatured = true;
      else if (activeCollection.type === "bestseller") where.isBestSeller = true;
      else {
        const ids = activeCollection.products.map((p: any) => p.productId);
        where.id = { in: ids };
      }
    }
  }

  const orderBy: any =
    sort === "price-asc" ? { price: "asc" } :
    sort === "price-desc" ? { price: "desc" } :
    sort === "rating" ? { rating: "desc" } :
    sort === "popular" ? { clicks: "desc" } : { createdAt: "desc" };

  const [products, cats, brands, platforms, sidebarBanner] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy, take: 60 }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, distinct: ["brand"], select: { brand: true } }),
    prisma.product.findMany({ where: { isActive: true }, distinct: ["platform"], select: { platform: true } }),
    prisma.banner.findFirst({ where: { slot: "sidebar", isActive: true }, orderBy: { order: "asc" } })
  ]);

  const heading = activeCategory?.name || activeCollection?.name || (featured ? "Featured Products" : best ? "Best Sellers" : q ? `Search: “${searchParams.q}”` : "All Products");

  return (
    <div className="container-x py-6">
      <nav className="text-sm text-ink-400 mb-3">
        <Link href="/" className="hover:text-brand-600">Home</Link> / <span className="text-ink-600">{heading}</span>
      </nav>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-900 mb-5">{heading}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        <aside className="bg-white rounded-lg border border-ink-100 p-4 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-2 font-semibold text-ink-800 mb-3"><SlidersHorizontal size={16}/> Filters</div>
          <form className="space-y-4 text-sm">
            <div>
              <div className="label">Search</div>
              <input name="q" defaultValue={searchParams.q} className="input" placeholder="Search..." />
            </div>
            <div>
              <div className="label">Category</div>
              <select name="category" defaultValue={categorySlug || ""} className="input">
                <option value="">All</option>
                {cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="label">Brand</div>
              <select name="brand" defaultValue={brand || ""} className="input">
                <option value="">All</option>
                {brands.filter(b => b.brand).map(b => <option key={b.brand} value={b.brand!}>{b.brand}</option>)}
              </select>
            </div>
            <div>
              <div className="label">Platform</div>
              <select name="platform" defaultValue={platform || ""} className="input">
                <option value="">All</option>
                {platforms.filter(p => p.platform).map(p => <option key={p.platform} value={p.platform!}>{p.platform}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><div className="label">Min €</div><input name="min" type="number" defaultValue={searchParams.min} className="input" /></div>
              <div><div className="label">Max €</div><input name="max" type="number" defaultValue={searchParams.max} className="input" /></div>
            </div>
            <div>
              <div className="label">Min Rating</div>
              <select name="rating" defaultValue={searchParams.rating || ""} className="input">
                <option value="">Any</option>
                <option value="4">4★ & up</option>
                <option value="4.5">4.5★ & up</option>
              </select>
            </div>
            {collectionSlug && <input type="hidden" name="collection" value={collectionSlug} />}
            <button className="btn-primary w-full">Apply Filters</button>
            <Link href="/products" className="btn-secondary w-full">Clear</Link>
          </form>
          <SidebarPoster banner={sidebarBanner} />
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-ink-100 px-4 py-2.5">
            <span className="text-sm text-ink-500">{products.length} product{products.length !== 1 ? "s" : ""}</span>
            <ProductSort sort={sort} />
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg border border-ink-100 p-12 text-center text-ink-400">
              No products match your filters. <Link href="/products" className="text-brand-600 hover:underline">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
