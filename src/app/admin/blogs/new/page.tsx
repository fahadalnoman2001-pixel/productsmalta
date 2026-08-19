import { prisma } from "@/lib/db";
import BlogForm from "@/components/admin/BlogForm";
export default async function NewBlog() {
  const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <div><h1 className="text-2xl font-bold mb-6">New Blog</h1><BlogForm cats={cats} /></div>;
}
