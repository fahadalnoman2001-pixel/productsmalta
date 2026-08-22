import { prisma } from "@/lib/db";
import MenuManager from "@/components/admin/MenuManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu Control | Admin Portal" };

export default async function AdminMenusPage() {
  const [items, categories, collections] = await Promise.all([
    prisma.menuItem.findMany({
      orderBy: { order: "asc" }
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { order: "asc" }
    }),
    prisma.collection.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { order: "asc" }
    })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <MenuManager
        initialItems={items}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
