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
  const c = await prisma.category.create({ data: body });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")!;
  const body = await req.json();
  delete body.id; delete body.subcategories;
  const c = await prisma.category.update({ where: { id }, data: body });
  return NextResponse.json(c);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id")!;
  if (type === "sub") await prisma.subcategory.delete({ where: { id } });
  else await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
