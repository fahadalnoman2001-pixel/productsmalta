import { prisma } from "@/lib/db";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Locale, isValidLocale, getHreflangMetadata, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: Record<string, string>;
}): Promise<Metadata> {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.common;

  const catSlug = searchParams.category;
  const q = searchParams.q;

  if (catSlug) {
    const c = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (c) {
      return {
        title: c.seoTitle ? `${c.seoTitle} — ${t.blog}` : `${c.name} — ${t.blog}`,
        description:
          c.seoDescription ||
          c.description ||
          `Expert buying guides, reviews, and tips for ${c.name} across Europe.`,
        alternates: getHreflangMetadata(`/blog?category=${catSlug}`, locale),
        openGraph: { images: c.image ? [c.image] : [] }
      };
    }
  }

  if (q) {
    return {
      title: `${t.search}: “${q}” — ${t.blog}`,
      description: `Articles and guides matching "${q}" on YourOffers.eu.`,
      alternates: getHreflangMetadata("/blog", locale)
    };
  }

  const titles: Record<Locale, string> = {
    en: "Blog & Buying Guides Across Europe — YourOffers.eu",
    de: "Blog & Kaufratgeber in Europa — YourOffers.eu",
    fr: "Blog & Guides d'Achat en Europe — YourOffers.eu",
    es: "Blog y Guías de Compra en Europa — YourOffers.eu"
  };

  const descriptions: Record<Locale, string> = {
    en: "Guides, reviews, and smart shopping tips for curated deals across Europe on YourOffers.eu.",
    de: "Ratgeber, Testberichte und clevere Einkaufstipps für Angebote in Europa auf YourOffers.eu.",
    fr: "Guides, comparatifs et conseils d'achat pour des offres sélectionnées en Europe sur YourOffers.eu.",
    es: "Guías, análisis y consejos de compra para ofertas seleccionadas en Europa en YourOffers.eu."
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    alternates: getHreflangMetadata("/blog", locale)
  };
}

export default async function BlogList({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: Record<string, string>;
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.common;

  const catSlug = searchParams.category;
  const q = searchParams.q?.toLowerCase();
  const where: any = { isPublished: true };
  if (catSlug) {
    const c = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (c) where.categoryId = c.id;
  }
  if (q)
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { tags: { contains: q } }
    ];

  const [blogs, cats] = await Promise.all([
    prisma.blog.findMany({ where, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } })
  ]);

  const featured = !catSlug && !q ? blogs.find(b => b.isTop) || blogs[0] : null;
  const rest = featured ? blogs.filter(b => b.id !== featured.id) : blogs;

  const blogPath = getLocalizedPath("/blog", locale);

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-ink-900 text-white">
        <div className="container-x py-10">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">{t.blog}</h1>
          <p className="text-ink-200 mt-2">
            Guides, reviews and smart shopping tips across Europe.
          </p>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="border-b border-ink-100 sticky top-0 bg-white/95 backdrop-blur z-30">
        <div className="container-x py-3 flex flex-wrap items-center gap-2">
          <Link
            href={blogPath}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              !catSlug && !q
                ? "bg-brand-500 text-white"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            All
          </Link>
          {cats.map(c => (
            <Link
              key={c.id}
              href={`${blogPath}?category=${c.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                catSlug === c.slug
                  ? "bg-brand-500 text-white"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200"
              }`}
            >
              {c.name}
            </Link>
          ))}
          <form action={blogPath} className="ml-auto">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder={`${t.search}...`}
              className="input w-56"
            />
          </form>
        </div>
      </div>

      <div className="container-x py-8">
        {q && (
          <p className="text-sm text-ink-500 mb-4">
            {blogs.length} result{blogs.length !== 1 ? "s" : ""} for “{searchParams.q}”
          </p>
        )}

        {/* Featured */}
        {featured && (
          <Link
            href={getLocalizedPath(`/blog/${featured.slug}`, locale)}
            className="group grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-hover transition mb-8"
          >
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
              <img
                src={
                  featured.coverImage ||
                  `https://picsum.photos/seed/${featured.slug}/900/600`
                }
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-600">
                Featured
                {featured.category?.name ? ` · ${featured.category.name}` : ""}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink-900 mt-2 group-hover:text-brand-600">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-ink-500 mt-3 line-clamp-3">{featured.excerpt}</p>
              )}
              <span className="flex items-center gap-1 text-sm text-ink-400 mt-4">
                <CalendarDays size={14} />{" "}
                {new Date(featured.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(b => (
            <Link
              key={b.id}
              href={getLocalizedPath(`/blog/${b.slug}`, locale)}
              className="group bg-white rounded-lg border border-ink-100 overflow-hidden hover:shadow-hover transition flex flex-col"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={b.coverImage || `https://picsum.photos/seed/${b.slug}/600/340`}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                {b.category?.name && (
                  <div className="text-xs text-brand-600 font-semibold uppercase mb-1">
                    {b.category.name}
                  </div>
                )}
                <h3 className="font-semibold text-ink-800 line-clamp-2 group-hover:text-brand-600 leading-snug">
                  {b.title}
                </h3>
                {b.excerpt && (
                  <p className="text-sm text-ink-500 mt-2 line-clamp-2 flex-1">
                    {b.excerpt}
                  </p>
                )}
                <span className="flex items-center gap-1 text-xs text-ink-400 mt-3">
                  <CalendarDays size={13} /> {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center text-ink-400 py-16">No articles found.</div>
        )}
      </div>
    </div>
  );
}
