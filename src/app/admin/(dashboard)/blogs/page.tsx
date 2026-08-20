import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import BlogRowActions from "@/components/admin/BlogRowActions";

export const dynamic = "force-dynamic";

export default async function AdminBlogs({ searchParams }: { searchParams: Record<string,string> }) {
  const q = searchParams.q?.toLowerCase();
  const status = searchParams.status;
  const where: any = {};
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;

  const [blogs, total, published, drafts] = await Promise.all([
    prisma.blog.findMany({ where, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.blog.count(),
    prisma.blog.count({ where: { isPublished: true } }),
    prisma.blog.count({ where: { isPublished: false } })
  ]);

  const Tab = ({ href, label, active }: any) => (
    <Link href={href} className={`px-3 py-1.5 rounded-md text-sm ${active ? "bg-brand-500 text-white" : "bg-white border border-ink-200 text-ink-700"}`}>{label}</Link>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Blogs</h1>
        <Link href="/admin/blogs/new" className="btn-primary"><Plus size={16}/> New Blog</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Tab href="/admin/blogs" label={`All (${total})`} active={!status} />
        <Tab href="/admin/blogs?status=published" label={`Published (${published})`} active={status === "published"} />
        <Tab href="/admin/blogs?status=draft" label={`Drafts (${drafts})`} active={status === "draft"} />
        <form action="/admin/blogs" className="ml-auto">
          <input name="q" defaultValue={searchParams.q} placeholder="Search blogs..." className="input w-64" />
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Post</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-center">Views</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(b => (
              <tr key={b.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={b.coverImage || `https://picsum.photos/seed/${b.slug}/80/60`} alt="" className="h-10 w-14 object-cover rounded border border-ink-100" />
                    <div>
                      <div className="font-medium text-ink-800">{b.title}</div>
                      <div className="text-xs text-ink-400">/{b.slug}{b.isTop ? " · ★ featured" : ""}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-ink-600">{b.category?.name || "-"}</td>
                <td className="p-3 text-center">{b.views}</td>
                <td className="p-3 text-center">
                  {b.isPublished
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Published</span>
                    : <span className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded">Draft</span>}
                </td>
                <td className="p-3 text-ink-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <BlogRowActions id={b.id} slug={b.slug} isPublished={b.isPublished} />
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-ink-400">No blogs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
