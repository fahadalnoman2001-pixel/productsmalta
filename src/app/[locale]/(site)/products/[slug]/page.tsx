import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice, parseJSON } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import Link from "next/link";
import { Star, ExternalLink, ShieldCheck, FileText } from "lucide-react";
import { Locale, isValidLocale, getHreflangMetadata, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return {};
  const imgs = parseJSON<string[]>(p.images, []);
  const tags = parseJSON<string[]>(p.tags, []);
  const metaTitle = p.seoTitle || `${p.title}${p.brand ? ` — ${p.brand}` : ""} Deal`;
  const metaDesc = p.seoDescription || p.shortDesc || p.description.slice(0, 160);

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    alternates: getHreflangMetadata(`/products/${params.slug}`, locale),
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: imgs.slice(0, 1)
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
      images: imgs.slice(0, 1)
    }
  };
}

export default async function ProductDetail({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.common;

  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, subcategory: true }
  });
  if (!p) return notFound();

  const imgs = parseJSON<string[]>(p.images, []);
  const tags = parseJSON<string[]>(p.tags, []);

  const related = await prisma.product.findMany({
    where: { categoryId: p.categoryId, id: { not: p.id }, isActive: true },
    include: { category: true },
    take: 5
  });

  const base = process.env.SITE_URL || "https://youroffers.eu";
  const localizedProductUrl = `${base}${getLocalizedPath(`/products/${p.slug}`, locale)}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    image: imgs,
    description: p.description,
    sku: p.id,
    mpn: p.id,
    category: p.category?.name,
    brand: { "@type": "Brand", name: p.brand || "YourOffers.eu" },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency,
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: p.platform || "Retailer" },
      url: p.affiliateUrl
    },
    ...(p.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating.toFixed(1),
            reviewCount: p.reviewCount > 0 ? p.reviewCount : 1
          }
        }
      : {})
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.home, item: `${base}${getLocalizedPath("/", locale)}` },
      {
        "@type": "ListItem",
        position: 2,
        name: t.allProducts,
        item: `${base}${getLocalizedPath("/products", locale)}`
      },
      ...(p.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: p.category.name,
              item: `${base}${getLocalizedPath(`/category/${p.category.slug}`, locale)}`
            }
          ]
        : []),
      { "@type": "ListItem", position: p.category ? 4 : 3, name: p.title, item: localizedProductUrl }
    ]
  };

  const hasDiscount = p.originalPrice && p.originalPrice > p.price;
  const discountPercent =
    hasDiscount && p.originalPrice
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0;

  return (
    <div className="container-x py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-sm text-ink-500 mb-6 flex flex-wrap items-center gap-1.5">
        <Link href={getLocalizedPath("/", locale)} className="hover:text-brand-600 transition">
          {t.home}
        </Link>
        <span>/</span>
        <Link href={getLocalizedPath("/products", locale)} className="hover:text-brand-600 transition">
          {t.allProducts}
        </Link>
        {p.category && (
          <>
            <span>/</span>
            <Link
              href={getLocalizedPath(`/category/${p.category.slug}`, locale)}
              className="hover:text-brand-600 transition"
            >
              {p.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink-800 font-medium truncate max-w-xs">{p.title}</span>
      </nav>

      {/* Main product view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl border border-ink-100 p-6 md:p-8 shadow-card mb-10">
        <ProductGallery images={imgs} title={p.title} />

        <div className="flex flex-col">
          {p.brand && (
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              {p.brand}
            </span>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 leading-tight">
            {p.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-3 pb-4 border-b border-ink-100">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star size={16} className="fill-amber-400 stroke-amber-400" />
              <span>{p.rating ? p.rating.toFixed(1) : "4.8"}</span>
            </div>
            <span className="text-xs text-ink-400">
              ({p.reviewCount || 120} {t.reviews})
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck size={14} /> {t.inStock}
            </span>
          </div>

          {/* Price Block */}
          <div className="my-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-sale-600">
                {formatPrice(p.price, p.currency)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-ink-400 line-through">
                    {formatPrice(p.originalPrice!, p.currency)}
                  </span>
                  <span className="bg-sale-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {t.verifiedEuropeanPrices}
            </p>
          </div>

          {/* Buy CTA */}
          <a
            href={`/api/affiliate/${p.id}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>
              {t.viewDealOn} {p.platform || "Retailer"}
            </span>
            <ExternalLink size={18} />
          </a>

          {/* Short description */}
          {p.shortDesc && (
            <p className="text-sm text-ink-600 mt-4 leading-relaxed">{p.shortDesc}</p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-ink-100">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description & Verdict Section */}
      <div className="bg-white rounded-2xl border border-ink-100 p-6 md:p-8 shadow-card mb-12">
        <h2 className="font-display text-xl font-bold text-ink-900 mb-4 pb-3 border-b border-ink-100 flex items-center gap-2">
          <FileText size={20} className="text-brand-600" />
          <span>{t.buyingGuideVerdict}</span>
        </h2>
        <div className="prose max-w-none text-ink-700 leading-relaxed text-sm md:text-base space-y-4">
          <p>{p.description}</p>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">
            {t.relatedDeals}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {related.map(rel => (
              <ProductCard key={rel.id} p={rel} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
