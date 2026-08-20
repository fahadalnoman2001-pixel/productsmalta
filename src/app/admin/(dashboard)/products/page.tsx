import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPrice, parseJSON } from "@/lib/utils";
import { Plus, Upload, Search } from "lucide-react";
import ProductRowActions from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProducts({
  searchParams
}: {
  searchParams?: { q?: string; status?: string; category?: string };
}) {
  const q = searchParams?.q?.toLowerCase()?.trim();
  const status = searchParams?.status;
  const categorySlug = searchParams?.category;

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } }
    ];
  }
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;
  if (status === "featured") where.isFeatured = true;
  if (status === "bestseller") where.isBestSeller = true;
  if (categorySlug) where.category = { slug: categorySlug };

  const [products, total, activeCount, featuredCount, bestCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { isBestSeller: true } })
  ]);

  const Tab = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm transition ${
        active
          ? "bg-brand-500 text-white font-medium shadow-sm"
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products ({total})</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog, edit details, and track performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/import" className="btn-secondary">
            <Upload size={16} /> CSV Import
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            <Plus size={16} /> New Product
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab href="/admin/products" label={`All (${total})`} active={!status} />
          <Tab href="/admin/products?status=active" label={`Active (${activeCount})`} active={status === "active"} />
          <Tab href="/admin/products?status=featured" label={`Featured (${featuredCount})`} active={status === "featured"} />
          <Tab href="/admin/products?status=bestseller" label={`Best Sellers (${bestCount})`} active={status === "bestseller"} />
        </div>
        <form action="/admin/products" method="GET" className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={searchParams?.q || ""}
            placeholder="Search products or brand..."
            className="input pl-9 pr-3 py-1.5 text-sm w-full"
          />
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-center">Clicks</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const images = parseJSON<string[]>(p.images, []);
                const thumbnail = images[0] || (p.images?.startsWith("http") ? p.images : null);

                return (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-md border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">No img</span>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="font-medium text-slate-800 hover:text-brand-600 transition truncate block"
                            title={p.title}
                          >
                            {p.title}
                          </Link>
                          <div className="text-xs text-slate-400 truncate">
                            /{p.slug} {p.platform ? `· ${p.platform}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {p.category?.name || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {p.brand || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{formatPrice(p.price, p.currency)}</div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-xs text-slate-400 line-through">
                          {formatPrice(p.originalPrice, p.currency)}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center text-slate-600 font-mono text-xs">
                      {p.clicks}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {p.isActive ? (
                          <span className="text-[10px] bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <ProductRowActions
                        id={p.id}
                        slug={p.slug}
                        isActive={p.isActive}
                        title={p.title}
                      />
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <p className="text-base font-medium text-slate-600">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search query or filter, or create a new product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
