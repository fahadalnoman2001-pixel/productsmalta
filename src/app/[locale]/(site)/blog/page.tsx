import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";
import { Locale, isValidLocale, getHreflangMetadata, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

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
  const pageNum = parseInt(searchParams.page || "1", 10);
  const pageSuffix = pageNum > 1 ? ` (Page ${pageNum})` : "";

  if (catSlug) {
    const c = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (c) {
      return {
        title: `${c.seoTitle ? c.seoTitle : `${c.name} — ${t.blog}`}${pageSuffix}`,
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
      title: `${t.search}: “${q}” — ${t.blog}${pageSuffix}`,
      description: `Articles and guides matching "${q}" on YourOffers.eu.`,
      alternates: getHreflangMetadata("/blog", locale)
    };
  }

  const titles: Record<Locale, string> = {
    en: `Blog & Buying Guides Across Europe — YourOffers.eu${pageSuffix}`,
    de: `Blog & Kaufratgeber in Europa — YourOffers.eu${pageSuffix}`,
    fr: `Blog & Guides d'Achat en Europe — YourOffers.eu${pageSuffix}`,
    es: `Blog y Guías de Compra en Europa — YourOffers.eu${pageSuffix}`
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

function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

function estimateReadingTime(content?: string | null, excerpt?: string | null): number {
  const text = (content || excerpt || "").replace(/<[^>]*>?/gm, "").trim();
  if (!text) return 3;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
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
  const q = searchParams.q?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);

  const where: any = { isPublished: true };
  if (catSlug) {
    const c = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (c) where.categoryId = c.id;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { tags: { contains: q } }
    ];
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, blogs, cats] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      include: { category: true },
      orderBy: [{ isTop: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } })
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const blogPath = getLocalizedPath("/blog", locale);

  const buildUrl = (targetPage: number, targetCat?: string | null, targetQ?: string | null) => {
    const query = new URLSearchParams();
    const finalCat = targetCat !== undefined ? targetCat : catSlug;
    const finalQ = targetQ !== undefined ? targetQ : q;

    if (finalCat) query.set("category", finalCat);
    if (finalQ) query.set("q", finalQ);
    if (targetPage > 1) query.set("page", targetPage.toString());

    const qs = query.toString();
    return `${blogPath}${qs ? `?${qs}` : ""}`;
  };

  const paginationRange = getPaginationRange(page, totalPages);

  // Show featured hero on page 1 only if no search and no category filter
  const isDefaultFirstPage = page === 1 && !catSlug && !q;
  const featured = isDefaultFirstPage && blogs.length > 0 ? blogs[0] : null;
  const displayBlogs = featured ? blogs.slice(1) : blogs;

  return (
    <div className="bg-ink-50/50 min-h-screen pb-16">
      {/* App Header & Hero */}
      <div className="bg-gradient-to-b from-ink-900 to-ink-800 text-white pt-8 pb-10 border-b border-ink-700/50">
        <div className="container-x">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-brand-400" />
              <span>Smart Shopping Hub</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {t.blog}
            </h1>
            <p className="text-ink-300 text-sm sm:text-base mt-2 leading-relaxed">
              Expert buying guides, curated product comparisons, and savvy shopping tips across Europe.
            </p>
          </div>

          {/* App-like Search Bar */}
          <div className="mt-6 max-w-xl">
            <form action={blogPath} method="GET" className="relative flex items-center">
              {catSlug && <input type="hidden" name="category" value={catSlug} />}
              <div className="absolute left-3.5 text-ink-400 pointer-events-none flex items-center">
                <Search size={17} />
              </div>
              <input
                name="q"
                defaultValue={q || ""}
                placeholder={`${t.searchPlaceholder || `${t.search} guides, reviews, topics...`}`}
                className="w-full bg-white text-ink-900 placeholder:text-ink-400 pl-10 pr-24 py-2.5 rounded-2xl text-sm font-medium shadow-md border border-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs"
              >
                {t.search}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Non-Sticky Horizontal Scrollable Category Bar (Single Line) */}
      <div className="bg-white border-b border-ink-100 py-3 shadow-xs">
        <div className="container-x">
          <div className="flex items-center justify-between gap-4">
            <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-1 w-full scroll-smooth">
              {/* "All" Filter Chip */}
              <Link
                href={buildUrl(1, null, q)}
                className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  !catSlug
                    ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30 ring-2 ring-brand-500/20"
                    : "bg-ink-100/80 text-ink-700 hover:bg-ink-200 hover:text-ink-900 border border-ink-200/50"
                }`}
              >
                All Articles
              </Link>

              {/* Category Filter Chips */}
              {cats.map(c => {
                const isActive = catSlug === c.slug;
                return (
                  <Link
                    key={c.id}
                    href={buildUrl(1, c.slug, q)}
                    className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30 ring-2 ring-brand-500/20"
                        : "bg-ink-100/80 text-ink-700 hover:bg-ink-200 hover:text-ink-900 border border-ink-200/50"
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators & Results Count */}
      <div className="container-x pt-6">
        {(q || catSlug) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 rounded-2xl border border-ink-100 shadow-xs">
            <span className="text-xs font-semibold text-ink-500">Active Filters:</span>
            {catSlug && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                <span>Category: {cats.find(c => c.slug === catSlug)?.name || catSlug}</span>
                <Link
                  href={buildUrl(1, null, q)}
                  className="hover:text-brand-900 text-brand-500"
                  aria-label="Remove category filter"
                >
                  <X size={13} />
                </Link>
              </span>
            )}
            {q && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                <span>Search: “{q}”</span>
                <Link
                  href={buildUrl(1, catSlug, null)}
                  className="hover:text-brand-900 text-brand-500"
                  aria-label="Clear search filter"
                >
                  <X size={13} />
                </Link>
              </span>
            )}
            <Link
              href={blogPath}
              className="text-xs text-ink-400 hover:text-ink-700 underline ml-auto font-medium"
            >
              Reset all
            </Link>
          </div>
        )}

        {/* Content Feed Section */}
        {blogs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-ink-100 p-10 sm:p-16 text-center my-8 shadow-xs">
            <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-ink-900 font-display">
              No articles found
            </h3>
            <p className="text-ink-500 text-sm mt-2 max-w-md mx-auto">
              We couldn't find any shopping guides or articles matching your criteria. Try adjusting your search or category filter.
            </p>
            <div className="mt-6">
              <Link
                href={blogPath}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-sm transition"
              >
                View All Articles
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Featured Article Card (App Spotlight style) - Only on page 1 without active search */}
            {featured && (
              <div className="mb-8">
                <Link
                  href={getLocalizedPath(`/blog/${featured.slug}`, locale)}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white rounded-3xl border border-ink-100 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-200 transition-all duration-300"
                >
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-ink-100">
                    <img
                      src={
                        featured.coverImage ||
                        `https://picsum.photos/seed/${featured.slug}/900/600`
                      }
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white shadow-md">
                        <Sparkles size={12} />
                        Featured Story
                      </span>
                    </div>
                  </div>
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-ink-400 font-medium mb-3">
                        {featured.category && (
                          <span className="text-brand-600 font-bold uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                            {featured.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />
                          {new Date(featured.createdAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {estimateReadingTime(featured.content, featured.excerpt)} min read
                        </span>
                      </div>

                      <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-ink-900 group-hover:text-brand-600 transition-colors leading-snug">
                        {featured.title}
                      </h2>

                      {featured.excerpt && (
                        <p className="text-ink-500 text-sm sm:text-base mt-3 line-clamp-3 leading-relaxed">
                          {featured.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink-400">
                        By {featured.author || "Editorial Team"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
                        Read full guide <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Grid of Articles (App Card design) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {displayBlogs.map(b => {
                const readTime = estimateReadingTime(b.content, b.excerpt);
                return (
                  <Link
                    key={b.id}
                    href={getLocalizedPath(`/blog/${b.slug}`, locale)}
                    className="group bg-white rounded-2xl border border-ink-100/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
                      <img
                        src={b.coverImage || `https://picsum.photos/seed/${b.slug}/600/380`}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      {b.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/95 text-brand-700 backdrop-blur-xs shadow-xs border border-ink-100">
                            {b.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[11px] sm:text-xs text-ink-400 font-medium mb-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {new Date(b.createdAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {readTime} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-ink-900 text-sm sm:text-base line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
                        {b.title}
                      </h3>

                      {/* Excerpt */}
                      {b.excerpt && (
                        <p className="text-xs sm:text-sm text-ink-500 mt-2 line-clamp-2 flex-1 leading-relaxed">
                          {b.excerpt}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs font-bold text-brand-600 mt-4 pt-3 border-t border-ink-50">
                        <span>Read article</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* App-Style Numbered Pagination Bar (1, 2, 3...) */}
            {totalPages > 1 && (
              <nav
                aria-label="Blog pagination"
                className="mt-12 pt-6 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Result count indicator */}
                <div className="text-xs sm:text-sm text-ink-500 font-medium text-center sm:text-left">
                  Showing <span className="font-semibold text-ink-800">{skip + 1}</span>–
                  <span className="font-semibold text-ink-800">
                    {Math.min(skip + blogs.length, totalCount)}
                  </span>{" "}
                  of <span className="font-semibold text-ink-800">{totalCount}</span> articles
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Previous Page Button */}
                  {page > 1 ? (
                    <Link
                      href={buildUrl(page - 1)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-ink-700 bg-white border border-ink-200 hover:bg-ink-50 hover:border-ink-300 transition-all shadow-xs"
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                    </Link>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-ink-300 bg-ink-50 border border-ink-100 cursor-not-allowed select-none"
                      aria-disabled="true"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                    </span>
                  )}

                  {/* Numbered Page Buttons (1, 2, 3...) */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {paginationRange.map((p, idx) => {
                      if (typeof p === "string") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-ink-400 font-bold text-xs sm:text-sm select-none"
                          >
                            …
                          </span>
                        );
                      }
                      const isCurrent = p === page;
                      return (
                        <Link
                          key={p}
                          href={buildUrl(p)}
                          className={`min-w-[34px] sm:min-w-[40px] h-[34px] sm:h-[40px] px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
                            isCurrent
                              ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30 ring-2 ring-brand-500/20"
                              : "bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 hover:text-ink-900"
                          }`}
                          aria-current={isCurrent ? "page" : undefined}
                          aria-label={`Go to page ${p}`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Next Page Button */}
                  {page < totalPages ? (
                    <Link
                      href={buildUrl(page + 1)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-ink-700 bg-white border border-ink-200 hover:bg-ink-50 hover:border-ink-300 transition-all shadow-xs"
                      aria-label="Go to next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-ink-300 bg-ink-50 border border-ink-100 cursor-not-allowed select-none"
                      aria-disabled="true"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={16} />
                    </span>
                  )}
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
