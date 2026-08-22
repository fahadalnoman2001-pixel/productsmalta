import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const c = await prisma.collection.create({ data: body });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")!;
  const body = await req.json();
  delete body.id; delete body.products;
  const c = await prisma.collection.update({ where: { id }, data: body });
  return NextResponse.json(c);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  try {
    // 1. Delete all collection-product pivot rows
    await prisma.collectionProduct.deleteMany({ where: { collectionId: id } });
    // 2. Delete the collection
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete collection" }, { status: 500 });
  }
}
