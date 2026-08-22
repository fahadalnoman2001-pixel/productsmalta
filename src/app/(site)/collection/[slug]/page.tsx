import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import ProductSort from "@/components/product/ProductSort";
import Link from "next/link";
import { Sparkles, Tag } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const col = await prisma.collection.findUnique({
    where: { slug: params.slug }
  });

  if (!col) return {};

  const metaTitle = `${col.name} — Curated Deals Across Europe`;
  const metaDesc =
    col.description ||
    `Browse our handpicked ${col.name} collection. Verified discounts and best prices across Europe on YourOffers.eu.`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: `/collection/${params.slug}`
    },
    openGraph: {
      title: `${col.name} | YourOffers.eu`,
      description: metaDesc,
      images: col.image ? [col.image] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${col.name} | YourOffers.eu`,
      description: metaDesc,
      images: col.image ? [col.image] : []
    }
  };
}

export default async function CollectionPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string>;
}) {
  const col = await prisma.collection.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        include: {
          product: {
            include: { category: true }
          }
        },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!col) return notFound();

  const sort = searchParams.sort || "order";
  let products = col.products
    .map(cp => cp.product)
    .filter(p => p && p.isActive);

  if (sort === "price_asc") products = [...products].sort((a, b) => a.price - b.price);
  if (sort === "price_desc") products = [...products].sort((a, b) => b.price - a.price);
  if (sort === "rating") products = [...products].sort((a, b) => b.rating - a.rating);

  const base = process.env.SITE_URL || "https://youroffers.eu";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${base}/products` },
      { "@type": "ListItem", position: 3, name: col.name, item: `${base}/collection/${col.slug}` }
    ]
  };

  return (
    <div className="container-x py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-sm text-ink-500 mb-6 flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-brand-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-600 transition">
          Collections
        </Link>
        <span>/</span>
        <span className="text-ink-900 font-semibold">{col.name}</span>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-2xl p-8 md:p-10 mb-8 shadow-md">
        <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={14} /> Featured Collection
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight">
          {col.name}
        </h1>
        <p className="mt-2 text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">
          {col.description ||
            `Curated selection of verified deals and trending offers in our ${col.name} spotlight.`}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white border border-ink-100 px-4 py-2.5 rounded-lg shadow-xs">
        <span className="text-xs font-semibold text-ink-600">
          {products.length} {products.length === 1 ? "offer" : "offers"}
        </span>
        <ProductSort sort={sort} />
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-100 p-12 text-center shadow-card">
          <Tag className="mx-auto text-slate-300 mb-3" size={32} />
          <h3 className="text-base font-bold text-ink-900">No products in this collection currently</h3>
          <Link href="/products" className="inline-block mt-4 text-xs font-semibold text-brand-600 hover:underline">
            Browse all products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
