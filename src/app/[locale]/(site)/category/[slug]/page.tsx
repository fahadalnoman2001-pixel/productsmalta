import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import ProductSort from "@/components/product/ProductSort";
import SidebarPoster from "@/components/SidebarPoster";
import Link from "next/link";
import { SlidersHorizontal, Tag } from "lucide-react";
import { parseJSON } from "@/lib/utils";
import { Locale, isValidLocale, getHreflangMetadata, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: { locale: string; slug: string };
  searchParams: Record<string, string>;
}): Promise<Metadata> {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const c = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { subcategories: true }
  });

  if (!c) return {};

  const tags = parseJSON<string[]>(c.tags, []);
  const metaTitle = c.seoTitle || `${c.name} Deals in Europe — Best Prices`;
  const metaDesc =
    c.seoDescription ||
    c.description ||
    `Shop the best ${c.name} deals in Europe. Compare handpicked products, verified retailers, and daily updated prices on YourOffers.eu.`;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    alternates: getHreflangMetadata(`/category/${params.slug}`, locale),
    openGraph: {
      title: `${c.name} Deals in Europe | YourOffers.eu`,
      description: metaDesc,
      images: c.image ? [c.image] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${c.name} Deals in Europe | YourOffers.eu`,
      description: metaDesc,
      images: c.image ? [c.image] : []
    }
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { locale: string; slug: string };
  searchParams: Record<string, string>;
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.common;

  const c = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { subcategories: true }
  });

  if (!c) return notFound();

  const q = searchParams.q?.toLowerCase();
  const brand = searchParams.brand;
  const platform = searchParams.platform;
  const minPrice = searchParams.min ? parseFloat(searchParams.min) : undefined;
  const maxPrice = searchParams.max ? parseFloat(searchParams.max) : undefined;
  const rating = searchParams.rating ? parseFloat(searchParams.rating) : undefined;
  const sort = searchParams.sort || "new";

  const subcategorySlug = searchParams.subcategory;
  const activeSubcategory = subcategorySlug
    ? c.subcategories.find(s => s.slug === subcategorySlug)
    : null;

  const where: any = {
    isActive: true,
    categoryId: c.id
  };

  if (activeSubcategory) {
    where.subcategoryId = activeSubcategory.id;
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } }
    ];
  }
  if (brand) where.brand = brand;
  if (platform) where.platform = platform;
  if (rating) where.rating = { gte: rating };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };
  if (sort === "popular") orderBy = { clicks: "desc" };

  const [products, brands, platforms, sidebarBanner] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { category: true } }),
    prisma.product.findMany({
      where: { categoryId: c.id, isActive: true },
      select: { brand: true },
      distinct: ["brand"]
    }),
    prisma.product.findMany({
      where: { categoryId: c.id, isActive: true },
      select: { platform: true },
      distinct: ["platform"]
    }),
    prisma.banner.findFirst({
      where: { slot: "sidebar", isActive: true },
      orderBy: { order: "asc" }
    })
  ]);

  const base = process.env.SITE_URL || "https://youroffers.eu";
  const localizedCategoryUrl = `${base}${getLocalizedPath(`/category/${c.slug}`, locale)}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.home, item: `${base}${getLocalizedPath("/", locale)}` },
      {
        "@type": "ListItem",
        position: 2,
        name: t.categories,
        item: `${base}${getLocalizedPath("/products", locale)}`
      },
      { "@type": "ListItem", position: 3, name: c.name, item: localizedCategoryUrl }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${c.name} Deals in Europe`,
    itemListElement: products.slice(0, 10).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title,
      url: `${base}${getLocalizedPath(`/products/${p.slug}`, locale)}`
    }))
  };

  const categoryPagePath = getLocalizedPath(`/category/${c.slug}`, locale);

  return (
    <div className="container-x py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-sm text-ink-500 mb-6 flex flex-wrap items-center gap-1.5">
        <Link href={getLocalizedPath("/", locale)} className="hover:text-brand-600 transition">
          {t.home}
        </Link>
        <span>/</span>
        <Link href={getLocalizedPath("/products", locale)} className="hover:text-brand-600 transition">
          {t.categories}
        </Link>
        <span>/</span>
        <span className="text-ink-900 font-semibold">{c.name}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 mb-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Tag size={14} /> {t.curatedCategoryDeals}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900">
            {c.name} Deals & Buying Guides
          </h1>
          <p className="text-ink-600 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            {c.description ||
              `Discover verified deals, top recommendations, and daily discounted offers for ${c.name} across Europe.`}
          </p>

          {c.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {c.subcategories.map(sub => (
                <span
                  key={sub.id}
                  className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full"
                >
                  {sub.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {c.image && (
          <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xs">
            <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <form
            action={categoryPagePath}
            className="bg-white rounded-xl border border-ink-100 p-5 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <span className="font-bold text-ink-900 text-sm flex items-center gap-2">
                <SlidersHorizontal size={16} /> {t.filters}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-600 block mb-1">
                {t.search} in {c.name}
              </label>
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q || ""}
                placeholder={`${t.search}...`}
                className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-sm focus:outline-brand-500"
              />
            </div>

            {brands.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-ink-600 block mb-1">
                  {t.brand}
                </label>
                <select
                  name="brand"
                  defaultValue={brand || ""}
                  className="w-full border border-ink-200 rounded-md px-2 py-1.5 text-sm bg-white text-ink-800"
                >
                  <option value="">{t.allBrands}</option>
                  {brands.map(
                    b =>
                      b.brand && (
                        <option key={b.brand} value={b.brand}>
                          {b.brand}
                        </option>
                      )
                  )}
                </select>
              </div>
            )}

            {platforms.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-ink-600 block mb-1">
                  {t.retailer}
                </label>
                <select
                  name="platform"
                  defaultValue={platform || ""}
                  className="w-full border border-ink-200 rounded-md px-2 py-1.5 text-sm bg-white text-ink-800"
                >
                  <option value="">{t.allRetailers}</option>
                  {platforms.map(
                    p =>
                      p.platform && (
                        <option key={p.platform} value={p.platform}>
                          {p.platform}
                        </option>
                      )
                  )}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs py-2 rounded-md transition"
              >
                {t.applyFilters}
              </button>
              <Link
                href={categoryPagePath}
                className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-md text-center transition"
              >
                {t.reset}
              </Link>
            </div>
          </form>

          <SidebarPoster banner={sidebarBanner} />
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4 bg-white border border-ink-100 px-4 py-2.5 rounded-lg shadow-xs">
            <span className="text-xs font-semibold text-ink-600">
              {products.length}{" "}
              {products.length === 1 ? t.offerFound : t.offersFound}
            </span>
            <ProductSort sort={sort} />
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-ink-100 p-12 text-center shadow-card">
              <Tag className="mx-auto text-slate-300 mb-3" size={32} />
              <h3 className="text-base font-bold text-ink-900">{t.noProductsFound}</h3>
              <p className="text-xs text-ink-500 mt-1">{t.clearFilters}</p>
              <Link
                href={categoryPagePath}
                className="inline-block mt-4 text-xs font-semibold text-brand-600 hover:underline"
              >
                {t.clearFilters}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} p={p} locale={locale} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
