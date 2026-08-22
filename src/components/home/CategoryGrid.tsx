import Link from "next/link";

export default function CategoryGrid({ categories, banners }: { categories: any[]; banners: any[] }) {
  const bMap = new Map(banners.map(b => [b.slotKey, b]));
  return (
    <section className="container-x py-6">
      <div className="bg-white rounded-lg border border-ink-100 p-5">
        <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-brand-500 inline-block" /> Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(c => {
            const b = bMap.get(c.slug);
            const img = c.image || b?.image || `https://picsum.photos/seed/${c.slug}/300/300`;
            return (
              <Link key={c.id} href={`/products?category=${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-brand-50 ring-1 ring-ink-100 group-hover:ring-brand-300 transition">
                  <img src={img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                </div>
                <span className="text-xs font-medium text-ink-700 group-hover:text-brand-600 leading-tight">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
