import { prisma } from "@/lib/db";
import CollectionManager from "@/components/admin/CollectionManager";

export default async function AdminCollections() {
  const [cols, products] = await Promise.all([
    prisma.collection.findMany({ orderBy: { order: "asc" }, include: { products: { include: { product: true }, orderBy: { order: "asc" } } } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { title: "asc" } })
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Collections</h1>
      <CollectionManager cols={cols} products={products} />
    </div>
  );
}
