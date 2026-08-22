import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { parseJSON } from "@/lib/utils";
import { CalendarDays, User, Clock } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = await prisma.blog.findUnique({ where: { slug: params.slug }, include: { category: true } });
  if (!b) return {};
  const tags = parseJSON<string[]>(b.tags, []);
  return {
    title: b.seoTitle || b.title,
    description: b.seoDescription || b.excerpt || b.title,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    alternates: {
      canonical: `/blog/${params.slug}`
    },
    openGraph: {
      title: b.seoTitle || b.title,
      description: b.seoDescription || b.excerpt || b.title,
      images: b.coverImage ? [b.coverImage] : [],
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: b.seoTitle || b.title,
      description: b.seoDescription || b.excerpt || b.title,
      images: b.coverImage ? [b.coverImage] : []
    }
  };
}

// Parse GitHub-flavored markdown tables into responsive HTML tables
function parseMarkdownTables(text: string): string {
  const lines = text.split(/\r?\n/);
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";

    const isHeader = (currentLine.trim().startsWith("|") || currentLine.trim().endsWith("|")) && currentLine.trim().includes("|");
    const isSeparator = /^\|?(\s*:?-+:?\s*\|)+\s*$/.test(nextLine.trim());

    if (isHeader && isSeparator) {
      const headerLine = currentLine.trim();
      const separatorLine = nextLine.trim();
      const tableRows: string[] = [];
      i += 2;

      while (i < lines.length && (lines[i].trim().startsWith("|") || lines[i].trim().endsWith("|")) && lines[i].trim().includes("|")) {
        tableRows.push(lines[i].trim());
        i++;
      }

      const alignments = separatorLine
        .split("|")
        .map(s => s.trim())
        .filter((_, idx, arr) => (idx > 0 && idx < arr.length - 1) || (arr.length === 2 && idx === 0))
        .map(col => {
          if (col.startsWith(":") && col.endsWith(":")) return "center";
          if (col.endsWith(":")) return "right";
          if (col.startsWith(":")) return "left";
          return "left";
        });

      const headerCells = headerLine
        .split("|")
        .map(s => s.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        .map((cell, idx) => `<th style="text-align: ${alignments[idx] || 'left'}">${cell}</th>`)
        .join("");

      const thead = `<thead><tr>${headerCells}</tr></thead>`;

      const tbodyRows = tableRows.map(row => {
        const cells = row
          .split("|")
          .map(s => s.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((cell, idx) => `<td style="text-align: ${alignments[idx] || 'left'}">${cell}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      }).join("\n");

      const tbody = `<tbody>\n${tbodyRows}\n</tbody>`;
      result.push(`\n<div class="table-wrapper"><table class="blog-table">\n${thead}\n${tbody}\n</table></div>\n`);
    } else {
      result.push(currentLine);
      i++;
    }
  }

  return result.join("\n");
}

// Convert markdown, tables, mixed markdown, and links to rich HTML
function toHtml(content: string) {
  if (!content) return "";

  let text = content;

  // 1. Convert markdown images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s\)\<\>]+|\/[^\s\)\<\>]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 max-w-full h-auto" />');

  // 2. Convert markdown links: [text](url) - supports inline and multiline splits
  text = text.replace(/\[([^\]]+)\]\s*\(\s*(https?:\/\/[^\s\)\<\>]+|\/[^\s\)\<\>]+)\s*\)/g, (match, label, url) => {
    const isInternal = url.startsWith("/");
    return `<a href="${url}" ${isInternal ? "" : 'target="_blank" rel="noopener noreferrer nofollow"'} class="text-brand-600 hover:text-brand-700 underline font-medium">${label}</a>`;
  });

  // 3. Convert markdown tables before paragraph splitting
  text = parseMarkdownTables(text);

  // If content is already rich standard HTML, return after markdown link & table conversion
  const looksHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|div)\b/i.test(text);
  if (looksHtml) {
    return text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  // 4. Convert headings
  text = text
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h2>$1</h2>");

  // 5. Convert bold & italic
  text = text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // 6. Convert blockquotes
  text = text.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

  // 7. Split by double newlines into blocks
  const blocks = text.split(/\n{2,}/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";

    if (/^<div class="table-wrapper"/i.test(trimmed)) {
      return trimmed;
    }

    // If block is a list (contains bullets or numbering)
    const lines = trimmed.split("\n");
    const isList = lines.some(l => /^[•\*\-]\s+|^\d+\.\s+/.test(l.trim()));

    if (isList) {
      const listItems = lines.map(line => {
        const lTrim = line.trim();
        if (/^[•\*\-]\s+(.*)$/.test(lTrim)) {
          return lTrim.replace(/^[•\*\-]\s+(.*)$/, "<li>$1</li>");
        }
        if (/^\d+\.\s+(.*)$/.test(lTrim)) {
          return lTrim.replace(/^\d+\.\s+(.*)$/, "<li>$1</li>");
        }
        return lTrim ? `<li>${lTrim}</li>` : "";
      }).filter(Boolean).join("\n");

      return `<ul class="list-disc pl-5 space-y-1.5 my-3">\n${listItems}\n</ul>`;
    }

    if (/^<(h[1-6]|blockquote|div|p|img|table)/i.test(trimmed)) {
      return trimmed;
    }

    // Regular paragraph: convert single line breaks to <br />
    const withBreaks = trimmed.replace(/\n/g, "<br />");
    return `<p>${withBreaks}</p>`;
  });

  let output = formattedBlocks.filter(Boolean).join("\n\n");
  // Merge consecutive <ul> lists into one
  output = output.replace(/<\/ul>\s*<ul class="[^"]*">/g, "\n");

  return output;
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

  const base = process.env.SITE_URL || "https://youroffers.eu";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: b.seoTitle || b.title,
    image: b.coverImage ? [b.coverImage] : [],
    datePublished: b.createdAt,
    dateModified: b.updatedAt,
    author: { "@type": "Person", name: b.author || "YourOffers.eu Editorial Team" },
    publisher: {
      "@type": "Organization",
      name: "YourOffers.eu",
      logo: { "@type": "ImageObject", url: `${base}/logo.png` }
    },
    description: b.seoDescription || b.excerpt || b.title,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/blog/${b.slug}` }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Blog & Guides", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: b.title, item: `${base}/blog/${b.slug}` }
    ]
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container-x pt-6">
        <nav className="text-sm text-ink-500 mb-6 flex flex-wrap items-center gap-1.5">
          <Link href="/" className="hover:text-brand-600 transition">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-brand-600 transition">Blog</Link>
          <span>/</span>
          <span className="text-ink-800 font-medium line-clamp-1">{b.title}</span>
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
