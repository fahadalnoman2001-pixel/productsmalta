import Link from "next/link";

/** Two side-by-side posters used to feature parallel promotions. */
export default function DoubleBanner({ banners }: { banners: any[] }) {
  if (!banners.length) return null;
  const pair = banners.slice(0, 2);
  return (
    <section className="container-x py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pair.map(b => (
          <Link key={b.id} href={b.link || "/products"} className="relative aspect-[16/9] rounded-xl overflow-hidden group border border-ink-100 block">
            <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent flex flex-col justify-end p-5 text-white">
              <div className="font-display text-xl md:text-2xl font-bold">{b.title}</div>
              {b.subtitle && <div className="text-sm opacity-90 mt-1">{b.subtitle}</div>}
              <span className="mt-3 inline-flex items-center gap-1 text-brand-300 text-sm font-semibold">Shop now →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
