import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const cats = await prisma.category.findMany({ include: { subcategories: true }, orderBy: { order: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const type = req.nextUrl.searchParams.get("type");
  const body = await req.json();
  if (type === "sub") {
    const c = await prisma.subcategory.create({ data: body });
    return NextResponse.json(c);
  }
  if (Array.isArray(body.tags)) body.tags = JSON.stringify(body.tags);
  if (body.order !== undefined) body.order = parseInt(body.order) || 0;
  const c = await prisma.category.create({ data: body });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")!;
  const body = await req.json();
  delete body.id;
  delete body.subcategories;
  delete body.products;
  delete body.blogs;
  delete body.createdAt;
  if (Array.isArray(body.tags)) body.tags = JSON.stringify(body.tags);
  if (body.order !== undefined) body.order = parseInt(body.order) || 0;
  const c = await prisma.category.update({ where: { id }, data: body });
  return NextResponse.json(c);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  try {
    if (type === "sub") {
      // 1. Unlink products associated with this subcategory
      await prisma.product.updateMany({
        where: { subcategoryId: id },
        data: { subcategoryId: null }
      });
      // 2. Delete the subcategory
      await prisma.subcategory.delete({ where: { id } });
      return NextResponse.json({ ok: true, deletedSubcategoryId: id });
    } else {
      // Deleting a main category:
      // 1. Find all subcategories under this category
      const subcategories = await prisma.subcategory.findMany({
        where: { categoryId: id },
        select: { id: true }
      });
      const subIds = subcategories.map(s => s.id);

      // 2. Unlink all products attached to this category or its subcategories
      if (subIds.length > 0) {
        await prisma.product.updateMany({
          where: { subcategoryId: { in: subIds } },
          data: { subcategoryId: null }
        });
      }
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null, subcategoryId: null }
      });

      // 3. Unlink blogs attached to this category
      await prisma.blog.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });

      // 4. Delete all subcategories
      await prisma.subcategory.deleteMany({ where: { categoryId: id } });

      // 5. Delete the category itself
      await prisma.category.delete({ where: { id } });

      return NextResponse.json({ ok: true, deletedCategoryId: id });
    }
  } catch (error: any) {
    console.error("Error deleting category/subcategory:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete from database" },
      { status: 500 }
    );
  }
}
