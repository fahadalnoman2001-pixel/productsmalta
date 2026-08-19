import { prisma } from "@/lib/db";
import { Package, FileText, Layers, Users, MousePointerClick } from "lucide-react";

export default async function Dashboard() {
  const [products, blogs, cats, cols, clicks, top] = await Promise.all([
    prisma.product.count(),
    prisma.blog.count(),
    prisma.category.count(),
    prisma.collection.count(),
    prisma.clickLog.count(),
    prisma.product.findMany({ orderBy: { clicks: "desc" }, take: 5, include: { category: true } })
  ]);
  const stats = [
    { label: "Products", value: products, icon: Package },
    { label: "Blogs", value: blogs, icon: FileText },
    { label: "Categories", value: cats, icon: Layers },
    { label: "Collections", value: cols, icon: Users },
    { label: "Affiliate Clicks", value: clicks, icon: MousePointerClick }
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm"><s.icon size={16}/> {s.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 card p-6">
        <div className="font-semibold mb-4">Top Products by Clicks</div>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 text-xs uppercase">
            <tr><th className="py-2">Product</th><th>Category</th><th>Clicks</th></tr>
          </thead>
          <tbody>
            {top.map(p => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{p.title}</td>
                <td>{p.category?.name || "-"}</td>
                <td>{p.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
