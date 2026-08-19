import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products ({products.length})</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/import" className="btn-secondary"><Upload size={16}/> CSV Import</Link>
          <Link href="/admin/products/new" className="btn-primary"><Plus size={16}/> New Product</Link>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Clicks</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.category?.name || "-"}</td>
                <td className="p-3">{p.brand}</td>
                <td className="p-3">{formatPrice(p.price, p.currency)}</td>
                <td className="p-3">{p.clicks}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {p.isActive && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>}
                    {p.isFeatured && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Featured</span>}
                    {p.isBestSeller && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Best</span>}
                  </div>
                </td>
                <td className="p-3"><Link href={`/admin/products/${p.id}`} className="text-brand-700 hover:underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
