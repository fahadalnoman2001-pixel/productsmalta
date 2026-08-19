import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slot = req.nextUrl.searchParams.get("slot");
  const banners = await prisma.banner.findMany({
    where: slot ? { slot } : {},
    orderBy: [{ slot: "asc" }, { order: "asc" }]
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.order == null) {
    const last = await prisma.banner.findFirst({ where: { slot: body.slot }, orderBy: { order: "desc" } });
    body.order = (last?.order ?? -1) + 1;
  }
  const b = await prisma.banner.create({ data: body });
  return NextResponse.json(b);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")!;
  const body = await req.json();
  delete body.id; delete body.createdAt;

  // Reorder ("move up/down")
  if (body.__move) {
    const dir = body.__move as "up" | "down"; delete body.__move;
    const cur = await prisma.banner.findUnique({ where: { id } });
    if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });
    const neighbor = await prisma.banner.findFirst({
      where: {
        slot: cur.slot,
        order: dir === "up" ? { lt: cur.order } : { gt: cur.order }
      },
      orderBy: { order: dir === "up" ? "desc" : "asc" }
    });
    if (neighbor) {
      await prisma.$transaction([
        prisma.banner.update({ where: { id: cur.id }, data: { order: neighbor.order } }),
        prisma.banner.update({ where: { id: neighbor.id }, data: { order: cur.order } })
      ]);
    }
    return NextResponse.json({ ok: true });
  }

  const b = await prisma.banner.update({ where: { id }, data: body });
  return NextResponse.json(b);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")!;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
