import { prisma } from "@/lib/db";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string> }) {
  const catSlug = searchParams.category;
  const q = searchParams.q;

  if (catSlug) {
    const c = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (c) {
      return {
        title: c.seoTitle ? `${c.seoTitle} — Blog` : `${c.name} Guides & Tips — Blog`,
        description: c.seoDescription || c.description || `Expert buying guides, reviews, and tips for ${c.name} across Europe.`,
        alternates: { canonical: `/blog?category=${catSlug}` },
        openGraph: { images: c.image ? [c.image] : [] }
      };
    }
  }

  if (q) {
    return {
      title: `Search: “${q}” — Blog Articles`,
      description: `Articles and guides matching "${q}" on YourOffers.eu.`
    };
  }

  return {
    title: "Blog — Guides, Reviews & Shopping Tips Across Europe",
    description: "Guides, reviews, and smart shopping tips for curated deals across Europe on YourOffers.eu.",
    alternates: { canonical: "/blog" }
  };
}

export default async function BlogList({ searchParams }: { searchParams: Record<string,string> }) {
  const catSlug = searchParams.category;
  const q = searchParams.q?.toLowerCase();
  const where: any = { isPublished: true };
  if (catSlug) { const c = await prisma.category.findUnique({ where: { slug: catSlug } }); if (c) where.categoryId = c.id; }
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }, { tags: { contains: q } }];

  const [blogs, cats] = await Promise.all([
    prisma.blog.findMany({ where, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } })
  ]);

  const featured = !catSlug && !q ? blogs.find(b => b.isTop) || blogs[0] : null;
  const rest = featured ? blogs.filter(b => b.id !== featured.id) : blogs;

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-ink-900 text-white">
        <div className="container-x py-10">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">The Blog & Buying Guides</h1>
          <p className="text-ink-200 mt-2">Guides, reviews and smart shopping tips across Europe.</p>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="border-b border-ink-100 sticky top-0 bg-white/95 backdrop-blur z-30">
        <div className="container-x py-3 flex flex-wrap items-center gap-2">
          <Link href="/blog" className={`px-3 py-1.5 rounded-full text-sm ${!catSlug && !q ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-700 hover:bg-ink-200"}`}>All</Link>
          {cats.map(c => (
            <Link key={c.id} href={`/blog?category=${c.slug}`} className={`px-3 py-1.5 rounded-full text-sm ${catSlug === c.slug ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-700 hover:bg-ink-200"}`}>{c.name}</Link>
          ))}
          <form action="/blog" className="ml-auto">
            <input name="q" defaultValue={searchParams.q} placeholder="Search articles..." className="input w-56" />
          </form>
        </div>
      </div>

      <div className="container-x py-8">
        {q && <p className="text-sm text-ink-500 mb-4">{blogs.length} result{blogs.length !== 1 ? "s" : ""} for “{searchParams.q}”</p>}

        {/* Featured */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-hover transition mb-8">
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
              <img src={featured.coverImage || `https://picsum.photos/seed/${featured.slug}/900/600`} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-600">Featured{featured.category?.name ? ` · ${featured.category.name}` : ""}</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink-900 mt-2 group-hover:text-brand-600">{featured.title}</h2>
              {featured.excerpt && <p className="text-ink-500 mt-3 line-clamp-3">{featured.excerpt}</p>}
              <span className="flex items-center gap-1 text-sm text-ink-400 mt-4"><CalendarDays size={14} /> {new Date(featured.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(b => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="group bg-white rounded-lg border border-ink-100 overflow-hidden hover:shadow-hover transition flex flex-col">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={b.coverImage || `https://picsum.photos/seed/${b.slug}/600/340`} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                {b.category?.name && <div className="text-xs text-brand-600 font-semibold uppercase mb-1">{b.category.name}</div>}
                <h3 className="font-semibold text-ink-800 line-clamp-2 group-hover:text-brand-600 leading-snug">{b.title}</h3>
                {b.excerpt && <p className="text-sm text-ink-500 mt-2 line-clamp-2 flex-1">{b.excerpt}</p>}
                <span className="flex items-center gap-1 text-xs text-ink-400 mt-3"><CalendarDays size={13} /> {new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>

        {blogs.length === 0 && <div className="text-center text-ink-400 py-16">No articles found.</div>}
      </div>
    </div>
  );
}
