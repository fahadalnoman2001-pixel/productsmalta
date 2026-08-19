import { prisma } from "@/lib/db";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategories() {
  const [cats, subs] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { subcategories: true } }),
    prisma.subcategory.findMany()
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories & Subcategories</h1>
      <CategoryManager cats={cats} subs={subs} />
    </div>
  );
}
