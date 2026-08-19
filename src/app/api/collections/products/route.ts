import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { collectionId, productId } = await req.json();
  const cp = await prisma.collectionProduct.upsert({
    where: { collectionId_productId: { collectionId, productId } },
    update: {}, create: { collectionId, productId }
  });
  return NextResponse.json(cp);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const collectionId = req.nextUrl.searchParams.get("collectionId")!;
  const productId = req.nextUrl.searchParams.get("productId")!;
  await prisma.collectionProduct.delete({ where: { collectionId_productId: { collectionId, productId } } });
  return NextResponse.json({ ok: true });
}
