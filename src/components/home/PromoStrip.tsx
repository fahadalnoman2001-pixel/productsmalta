import Link from "next/link";

/** Thin horizontal promo bar. Rotates through active promo banners as a single row. */
export default function PromoStrip({ banners }: { banners: any[] }) {
  if (!banners.length) return null;
  return (
    <section className="container-x pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {banners.slice(0, 2).map(b => (
          <Link key={b.id} href={b.link || "#"} className="relative aspect-[21/5] rounded-lg overflow-hidden group border border-ink-100 bg-white block">
            <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-ink-900/30 to-transparent flex items-center px-5">
              <div className="text-white">
                <div className="font-display font-bold text-lg leading-tight">{b.title}</div>
                {b.subtitle && <div className="text-xs opacity-90 mt-0.5">{b.subtitle}</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
