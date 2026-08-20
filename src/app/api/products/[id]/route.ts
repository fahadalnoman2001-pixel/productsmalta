import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    delete body.id; delete body.createdAt; delete body.updatedAt; delete body.clicks;
    const updated = await prisma.product.update({ where: { id: params.id }, data: body });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    // Delete relation records to ensure clean deletion from database
    await prisma.collectionProduct.deleteMany({ where: { productId: params.id } });
    await prisma.clickLog.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, id: params.id });
  } catch (error: any) {
    console.error("Error deleting product from database:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete product from database" }, { status: 500 });
  }
}
