import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { formatPrice, parseJSON } from "@/lib/utils";

export default function ProductCard({ p }: { p: any }) {
  const imgs = parseJSON<string[]>(p.images, []);
  const primary = imgs[0] || "https://picsum.photos/seed/def/600/600";
  const secondary = imgs[1] || primary;
  const off = p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
  return (
    <div className="pcard overflow-hidden group flex flex-col">
      <Link href={`/products/${p.slug}`} className="relative block aspect-square overflow-hidden bg-white p-3">
        <img src={primary} alt={p.title} className="img-primary absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] object-contain" loading="lazy" />
        <img src={secondary} alt="" className="img-secondary absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] object-contain" loading="lazy" />
        {off > 0 && (
          <span className="absolute top-2 left-2 bg-sale-500 text-white text-[11px] font-bold px-2 py-1 rounded">-{off}%</span>
        )}
        {p.isBestSeller && (
          <span className="absolute top-2 right-2 bg-ink-900 text-white text-[10px] font-semibold px-2 py-1 rounded">BESTSELLER</span>
        )}
      </Link>
      <div className="p-3 pt-2 flex flex-col flex-1 border-t border-ink-50">
        <div className="flex items-center justify-between text-[11px] text-ink-400 mb-1">
          <span className="font-semibold text-ink-600 uppercase tracking-wide">{p.brand}</span>
          <span className="flex items-center gap-0.5 text-amber-500"><Star size={12} className="fill-amber-400 stroke-amber-400" /> {p.rating?.toFixed(1)}</span>
        </div>
        <Link href={`/products/${p.slug}`} className="text-sm text-ink-800 line-clamp-2 min-h-[2.5rem] hover:text-brand-600 leading-snug">
          {p.title}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-sale-600">{formatPrice(p.price, p.currency)}</span>
          {p.originalPrice && p.originalPrice > p.price && (
            <span className="text-xs text-ink-400 line-through">{formatPrice(p.originalPrice, p.currency)}</span>
          )}
        </div>
        <a href={`/api/affiliate/${p.id}`} target="_blank" rel="nofollow sponsored noopener" className="btn-primary w-full mt-3">
          <ShoppingCart size={15} /> Buy Now
        </a>
      </div>
    </div>
  );
}
