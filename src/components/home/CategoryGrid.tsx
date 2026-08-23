import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Locale, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function CategoryGrid({
  categories = [],
  banners = [],
  locale = "en"
}: {
  categories: any[];
  banners?: any[];
  locale?: Locale;
}) {
  const bMap = new Map((banners || []).map(b => [b.slotKey, b]));

  if (!categories || categories.length === 0) return null;

  const dict = getDictionary(locale);
  const t = dict.common;

  return (
    <section className="container-x py-4 sm:py-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-4.5 w-1.5 rounded-full bg-brand-500 inline-block" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {t.allCategories}
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {categories.length} {t.categories}
            </span>
          </div>

          <Link
            href={getLocalizedPath("/products", locale)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition"
          >
            <span>{t.browseAll}</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Smart-sized Category Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-2.5">
          {categories.map(c => {
            const b = bMap.get(c.slug);
            const img =
              c.image || b?.image || `https://picsum.photos/seed/${c.slug}/150/150`;

            return (
              <Link
                key={c.id}
                href={getLocalizedPath(`/category/${c.slug}`, locale)}
                className="group flex flex-col items-center gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 transition-all duration-150 text-center"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/90 group-hover:border-brand-400 group-hover:bg-brand-50/60 group-hover:shadow-sm transition-all duration-200 flex items-center justify-center p-2.5 shrink-0">
                  <img
                    src={img}
                    alt={c.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                  />
                </div>
                <span className="text-[11px] sm:text-[11.5px] font-semibold text-slate-700 group-hover:text-brand-600 leading-tight line-clamp-2 transition">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
