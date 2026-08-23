import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { Locale, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function ProductRow({
  title,
  subtitle,
  products,
  viewAll,
  accent,
  locale = "en"
}: {
  title: string;
  subtitle?: string;
  products: any[];
  viewAll?: string;
  accent?: boolean;
  locale?: Locale;
}) {
  if (!products.length) return null;

  const dict = getDictionary(locale);
  const t = dict.common;
  const localizedViewAll = viewAll ? getLocalizedPath(viewAll, locale) : undefined;

  return (
    <section className="container-x py-6">
      <div className="bg-white rounded-lg border border-ink-100 overflow-hidden">
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b border-ink-100 ${
            accent ? "bg-brand-50" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-brand-500 inline-block" />
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold text-ink-900 leading-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
            </div>
          </div>
          {localizedViewAll && (
            <Link
              href={localizedViewAll}
              className="text-brand-600 text-sm font-semibold hover:underline whitespace-nowrap"
            >
              {t.seeAll}
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
          {products.map(p => (
            <ProductCard key={p.id} p={p} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
