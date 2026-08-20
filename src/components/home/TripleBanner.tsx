import Link from "next/link";

interface BannerItem {
  id?: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  badge?: string;
}

/**
 * Three small posters row for featured promotions and category highlights.
 * Fully driven by the "Triple Poster" slot in /admin/banners.
 * If no active triple banners exist in the database, this section is hidden.
 * The `slotKey` field on each banner is used as the orange badge label.
 */
export default function TripleBanner({ banners = [] }: { banners?: any[] }) {
  if (!banners || banners.length === 0) return null;

  const items: BannerItem[] = banners.slice(0, 3).map(b => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    link: b.link,
    badge: b.slotKey || undefined
  }));

  const cols =
    items.length === 3 ? "md:grid-cols-3" :
    items.length === 2 ? "md:grid-cols-2" : "";

  return (
    <section className="container-x pt-4 pb-2">
      <div className={`grid grid-cols-1 gap-4 ${cols}`}>
        {items.map((b, idx) => (
          <Link
            key={b.id || idx}
            href={b.link || "/products"}
            className="group relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] rounded-xl overflow-hidden border border-ink-100 shadow-sm hover:shadow-md transition-all duration-300 block bg-ink-900"
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-95 group-hover:brightness-100"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 text-white">
              <div>
                {b.badge && (
                  <span className="inline-block bg-brand-500 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    {b.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl leading-tight text-white group-hover:text-brand-300 transition-colors">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-xs sm:text-sm text-ink-200 mt-1 line-clamp-1 opacity-90">
                    {b.subtitle}
                  </p>
                )}
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 group-hover:text-white transition-colors">
                  <span>Shop now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
