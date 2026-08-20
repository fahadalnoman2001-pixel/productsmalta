import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { parseJSON } from "@/lib/utils";
import { CalendarDays, User, Clock } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = await prisma.blog.findUnique({ where: { slug: params.slug } });
  if (!b) return {};
  return {
    title: b.seoTitle || b.title,
    description: b.seoDescription || b.excerpt || b.title,
    openGraph: { images: b.coverImage ? [b.coverImage] : [], type: "article" }
  };
}

// If content already contains HTML tags, render as-is. Otherwise treat the
// legacy seed content as light markdown and convert the basics.
function toHtml(content: string) {
  const looksHtml = /<\/?(p|h[1-6]|ul|ol|li|img|a|strong|em|blockquote|br|div)\b/i.test(content);
  if (looksHtml) return content;
  const html = content
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .split(/\n{2,}/).map(p => p.match(/^\s*<(h2|h3|ul|ol|blockquote)/) ? p : `<p>${p.trim()}</p>`).join("\n");
  return html;
}

function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const b = await prisma.blog.findUnique({ where: { slug: params.slug }, include: { category: true } });
  if (!b) return notFound();

  // best-effort view increment (non-blocking)
  prisma.blog.update({ where: { id: b.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const tags = parseJSON<string[]>(b.tags, []);
  const html = toHtml(b.content);
  const related = await prisma.blog.findMany({
    where: { id: { not: b.id }, isPublished: true, categoryId: b.categoryId ?? undefined },
    take: 3, orderBy: { createdAt: "desc" }, include: { category: true }
  });

  const schema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: b.title, image: b.coverImage ? [b.coverImage] : [], datePublished: b.createdAt, dateModified: b.updatedAt,
    author: { "@type": "Person", name: b.author },
    description: b.excerpt || b.seoDescription,
    mainEntityOfPage: { "@type": "WebPage" }
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Header */}
      <div className="container-x pt-6">
        <nav className="text-sm text-ink-400 mb-4">
          <Link href="/" className="hover:text-brand-600">Home</Link> /{" "}
          <Link href="/blog" className="hover:text-brand-600">Blog</Link>
          {b.category && <> / <Link href={`/blog?category=${b.category.slug}`} className="hover:text-brand-600">{b.category.name}</Link></>}
        </nav>
      </div>

      <article className="container-x max-w-3xl pb-12">
        {b.category?.name && (
          <Link href={`/blog?category=${b.category.slug}`} className="inline-block text-xs font-bold uppercase tracking-wide text-brand-600 mb-2">
            {b.category.name}
          </Link>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink-900 leading-tight">{b.title}</h1>
        {b.excerpt && <p className="text-lg text-ink-500 mt-3">{b.excerpt}</p>}

        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-500 mt-4 pb-6 border-b border-ink-100">
          <span className="flex items-center gap-1"><User size={14} /> {b.author}</span>
          <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {readingTime(html)} min read</span>
        </div>

        {b.coverImage && (
          <div className="aspect-[16/9] mt-6 rounded-xl overflow-hidden">
            <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="blog-content mt-8" dangerouslySetInnerHTML={{ __html: html }} />

        {tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {tags.map(t => (
              <Link key={t} href={`/blog?q=${encodeURIComponent(t)}`} className="text-xs bg-ink-100 text-ink-700 px-3 py-1 rounded-full hover:bg-brand-50 hover:text-brand-700">#{t}</Link>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-lg bg-ink-50 border border-ink-100 p-4 text-xs text-ink-500">
          Some links in this article are affiliate links. We may earn a commission when you buy through them — at no extra cost to you.
        </div>
      </article>

      {related.length > 0 && (
        <div className="border-t border-ink-100 bg-ink-50/50">
          <div className="container-x py-10">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group bg-white rounded-lg border border-ink-100 overflow-hidden hover:shadow-hover transition">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={r.coverImage || `https://picsum.photos/seed/${r.slug}/600/340`} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="p-4">
                    {r.category?.name && <div className="text-xs text-brand-600 font-semibold uppercase mb-1">{r.category.name}</div>}
                    <h3 className="font-semibold text-ink-800 line-clamp-2 group-hover:text-brand-600 leading-snug">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
