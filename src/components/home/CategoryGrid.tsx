import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CategoryGrid({
  categories,
  banners
}: {
  categories: any[];
  banners: any[];
}) {
  const bMap = new Map(banners.map(b => [b.slotKey, b]));

  // Safe display list with fallback to all categories
  const displayCats =
    categories && categories.length > 0
      ? categories.filter(c => c.showOnHomepage !== false)
      : [];
  const finalCats = displayCats.length > 0 ? displayCats : categories || [];

  if (!finalCats || finalCats.length === 0) return null;

  return (
    <section className="container-x py-4 sm:py-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-4.5 w-1.5 rounded-full bg-brand-500 inline-block" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {finalCats.length} Categories
            </span>
          </div>

          <Link
            href="/products"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition"
          >
            <span>All Categories</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Minimal Compact Category Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 sm:gap-2">
          {finalCats.map(c => {
            const b = bMap.get(c.slug);
            const img =
              c.image || b?.image || `https://picsum.photos/seed/${c.slug}/200/200`;

            return (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 transition-all duration-150 text-center"
              >
                {/* Minimal Compact Icon Circle */}
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-slate-50 ring-1 ring-slate-200/80 group-hover:ring-2 group-hover:ring-brand-400 group-hover:shadow-xs transition-all duration-200 flex items-center justify-center p-0.5">
                  <img
                    src={img}
                    alt={c.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition duration-200"
                  />
                </div>
                {/* Category Name */}
                <span className="text-[11px] sm:text-[11.5px] font-medium text-slate-700 group-hover:text-brand-600 leading-tight line-clamp-2 transition">
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
