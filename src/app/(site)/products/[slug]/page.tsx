import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice, parseJSON } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import Link from "next/link";
import { Star, ExternalLink, ShieldCheck, Tag, FileText } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return {};
  const imgs = parseJSON<string[]>(p.images, []);
  const tags = parseJSON<string[]>(p.tags, []);
  const metaTitle = p.seoTitle || `${p.title} | ${p.brand || "Products in Malta"}`;
  const metaDesc = p.seoDescription || p.shortDesc || p.description.slice(0, 160);

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
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

export default async function ProductDetail({ params }: { params: { slug: string } }) {
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    image: imgs,
    description: p.description,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency,
      availability: "https://schema.org/InStock",
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

  const hasDiscount = p.originalPrice && p.originalPrice > p.price;
  const discountPercent = hasDiscount && p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

  return (
    <div className="container-x py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      {/* Breadcrumbs */}
      <nav className="text-sm text-ink-500 mb-6 flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-brand-600 transition">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-600 transition">Products</Link>
        {p.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${p.category.slug}`} className="hover:text-brand-600 transition">
              {p.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink-800 font-medium line-clamp-1">{p.title}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
        {/* Left: Interactive Image Gallery */}
        <div>
          <ProductGallery images={imgs} title={p.title} />
        </div>

        {/* Right: Product Overview & Buy Action */}
        <div className="flex flex-col justify-start">
          {p.brand && <div className="text-xs text-brand-600 font-bold uppercase tracking-wider">{p.brand}</div>}
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 mt-1 leading-tight">{p.title}</h1>
          
          {/* Rating, Reviews & Platform (hides '0 reviews') */}
          <div className="flex items-center flex-wrap gap-2 mt-2.5 text-sm text-ink-600">
            {p.rating > 0 && (
              <span className="flex items-center gap-1 font-medium text-ink-800">
                <Star size={15} className="fill-amber-400 stroke-amber-400" />
                {p.rating.toFixed(1)}
              </span>
            )}
            {p.reviewCount > 0 && (
              <span className="text-ink-500">
                {p.rating > 0 ? "· " : ""}{p.reviewCount.toLocaleString()} {p.reviewCount === 1 ? "review" : "reviews"}
              </span>
            )}
            {p.platform && (
              <span className="text-ink-500">
                {(p.rating > 0 || p.reviewCount > 0) ? "· " : ""}on <span className="font-semibold text-ink-700">{p.platform}</span>
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-sale-600">{formatPrice(p.price, p.currency)}</span>
            {hasDiscount && p.originalPrice && (
              <>
                <span className="text-lg text-ink-400 line-through">{formatPrice(p.originalPrice, p.currency)}</span>
                <span className="bg-sale-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          {p.shortDesc && (
            <div className="mt-4 text-ink-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {p.shortDesc}
            </div>
          )}

          {/* CTA Buy Button */}
          <div className="mt-6">
            <a
              href={`/api/affiliate/${p.id}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} /> Buy Now on {p.platform || "Store"}
            </a>
          </div>

          {/* Product Meta Specs */}
          <div className="mt-6 pt-5 border-t border-ink-100 grid grid-cols-2 gap-3 text-sm">
            {p.category && (
              <div>
                <span className="text-ink-400">Category:</span>{" "}
                <Link href={`/products?category=${p.category.slug}`} className="text-brand-600 font-medium hover:underline">
                  {p.category.name}
                </Link>
              </div>
            )}
            {p.subcategory && (
              <div>
                <span className="text-ink-400">Subcategory:</span>{" "}
                <span className="font-medium text-ink-800">{p.subcategory.name}</span>
              </div>
            )}
            {p.brand && (
              <div>
                <span className="text-ink-400">Brand:</span>{" "}
                <span className="font-medium text-ink-800">{p.brand}</span>
              </div>
            )}
            {p.platform && (
              <div>
                <span className="text-ink-400">Platform:</span>{" "}
                <span className="font-medium text-ink-800">{p.platform}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="text-xs bg-ink-100 text-ink-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag size={11} className="text-ink-400" /> {t}
                </span>
              ))}
            </div>
          )}

          {/* Affiliate Disclosure Box */}
          <div className="mt-6 flex items-start gap-2.5 text-xs text-ink-500 bg-ink-50 p-3.5 rounded-lg border border-ink-100">
            <ShieldCheck size={16} className="text-green-600 shrink-0 mt-0.5" />
            <span>Affiliate link — we may earn a commission when you buy through this link, at no extra cost to you.</span>
          </div>
        </div>
      </div>

      {/* Full Long Description Section */}
      {p.description && (
        <section className="mt-10 bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink-900 mb-4 pb-3 border-b border-ink-100 flex items-center gap-2">
            <FileText size={22} className="text-brand-500" /> Product Description
          </h2>
          <div className="text-ink-700 text-base leading-relaxed whitespace-pre-line">
            {p.description}
          </div>
        </section>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map(r => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
