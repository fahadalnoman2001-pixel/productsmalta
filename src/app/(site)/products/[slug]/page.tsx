import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice, parseJSON } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Star, ExternalLink, ShieldCheck, Tag } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return {};
  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.description.slice(0, 160),
    openGraph: { images: parseJSON<string[]>(p.images, []).slice(0, 1) }
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
    include: { category: true }, take: 5
  });

  const schema = {
    "@context": "https://schema.org", "@type": "Product",
    name: p.title, image: imgs, description: p.description, brand: { "@type": "Brand", name: p.brand },
    offers: { "@type": "Offer", price: p.price, priceCurrency: p.currency, availability: "https://schema.org/InStock", url: p.affiliateUrl },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.toFixed(1), reviewCount: p.reviewCount }
  };

  return (
    <div className="container-x py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/">Home</Link> / <Link href="/products">Products</Link>
        {p.category && <> / <Link href={`/products?category=${p.category.slug}`}>{p.category.name}</Link></>}
        <span> / {p.title}</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3">
            <img src={imgs[0]} alt={p.title} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {imgs.slice(0, 4).map((src, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-50">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm text-brand-700 font-semibold uppercase">{p.brand}</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mt-1">{p.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 stroke-yellow-400" /> {p.rating.toFixed(1)}</span>
            <span>· {p.reviewCount} reviews</span>
            {p.platform && <span>· on {p.platform}</span>}
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">{formatPrice(p.price, p.currency)}</span>
            {p.originalPrice && p.originalPrice > p.price && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(p.originalPrice, p.currency)}</span>
            )}
          </div>
          <p className="mt-4 text-slate-700 leading-relaxed">{p.description}</p>

          <div className="mt-6 flex gap-3">
            <a href={`/api/affiliate/${p.id}`} target="_blank" rel="nofollow sponsored noopener" className="btn-accent px-6 py-3 text-base">
              <ExternalLink size={16} /> Buy Now on {p.platform || "Store"}
            </a>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {p.category && <div><span className="text-slate-500">Category:</span> <Link href={`/products?category=${p.category.slug}`} className="text-brand-700 font-medium">{p.category.name}</Link></div>}
            {p.subcategory && <div><span className="text-slate-500">Subcategory:</span> <span className="font-medium">{p.subcategory.name}</span></div>}
            {p.brand && <div><span className="text-slate-500">Brand:</span> <span className="font-medium">{p.brand}</span></div>}
            {p.platform && <div><span className="text-slate-500">Platform:</span> <span className="font-medium">{p.platform}</span></div>}
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"><Tag size={10} className="inline" /> {t}</span>)}
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <ShieldCheck size={16} className="text-green-600 shrink-0 mt-0.5" />
            <span>Affiliate link — we may earn a commission when you buy through this link, at no extra cost to you.</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map(r => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
