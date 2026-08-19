import Link from "next/link";

/** Vertical poster shown on /products sidebar. */
export default function SidebarPoster({ banner }: { banner: any }) {
  if (!banner) return null;
  return (
    <Link href={banner.link || "/products"} className="relative block aspect-[3/4] rounded-lg overflow-hidden group border border-ink-100 mt-4">
      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 to-transparent flex flex-col justify-end p-3 text-white">
        <div className="font-display font-bold text-lg leading-tight">{banner.title}</div>
        {banner.subtitle && <div className="text-xs opacity-90 mt-0.5">{banner.subtitle}</div>}
        <span className="mt-2 text-brand-300 text-xs font-semibold">Shop now →</span>
      </div>
    </Link>
  );
}
