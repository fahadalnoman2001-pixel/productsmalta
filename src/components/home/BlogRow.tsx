import Link from "next/link";

export default function BlogRow({ blogs }: { blogs: any[] }) {
  if (!blogs.length) return null;
  return (
    <section className="container-x py-6">
      <div className="bg-white rounded-lg border border-ink-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-brand-500 inline-block" />
            <h2 className="font-display text-lg md:text-xl font-bold text-ink-900">From the Blog</h2>
          </div>
          <Link href="/blog" className="text-brand-600 text-sm font-semibold hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {blogs.map(b => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="group rounded-lg border border-ink-100 overflow-hidden hover:shadow-hover transition">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={b.coverImage || `https://picsum.photos/seed/${b.slug}/600/340`} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="p-4">
                {b.category?.name && <div className="text-xs text-brand-600 font-semibold uppercase mb-1">{b.category.name}</div>}
                <h3 className="font-semibold text-ink-800 line-clamp-2 group-hover:text-brand-600 leading-snug">{b.title}</h3>
                {b.excerpt && <p className="text-sm text-ink-500 mt-2 line-clamp-2">{b.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
