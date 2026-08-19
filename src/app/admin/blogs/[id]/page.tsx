import { prisma } from "@/lib/db";
import BlogForm from "@/components/admin/BlogForm";
import { notFound } from "next/navigation";
export default async function EditBlog({ params }: { params: { id: string } }) {
  const [blog, cats] = await Promise.all([
    prisma.blog.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!blog) return notFound();
  return <div><h1 className="text-2xl font-bold mb-6">Edit Blog</h1><BlogForm blog={blog} cats={cats} /></div>;
}
