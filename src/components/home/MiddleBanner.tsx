import Link from "next/link";

/** Full-width horizontal poster shown between homepage product rows. */
export default function MiddleBanner({ banner }: { banner: any }) {
  if (!banner) return null;
  return (
    <section className="container-x py-4">
      <Link href={banner.link || "/products"} className="relative block aspect-[21/5] md:aspect-[21/4] rounded-xl overflow-hidden group border border-ink-100">
        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/80 to-brand-500/20 flex items-center px-6 md:px-12">
          <div className="text-white max-w-xl">
            <span className="inline-block bg-white text-brand-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Special</span>
            <div className="font-display text-xl md:text-3xl font-extrabold leading-tight mt-2">{banner.title}</div>
            {banner.subtitle && <div className="text-sm md:text-base opacity-90 mt-1">{banner.subtitle}</div>}
            <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold underline underline-offset-4">Shop now →</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
