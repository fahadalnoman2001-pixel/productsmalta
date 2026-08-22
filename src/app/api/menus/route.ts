import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get("location");
  const where: any = {};
  if (location) {
    where.location = location;
  }
  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { order: "asc" }
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.label || !body.url) {
    return NextResponse.json({ error: "Label and URL are required" }, { status: 400 });
  }

  const highestOrder = await prisma.menuItem.aggregate({
    _max: { order: true },
    where: { location: body.location || "main" }
  });

  const nextOrder = body.order !== undefined
    ? parseInt(body.order, 10)
    : (highestOrder._max.order ?? -1) + 1;

  const item = await prisma.menuItem.create({
    data: {
      label: body.label.trim(),
      url: body.url.trim(),
      location: body.location || "main",
      order: nextOrder,
      target: body.target || "_self",
      badge: body.badge?.trim() || null,
      badgeColor: body.badgeColor?.trim() || null,
      isHighlighted: Boolean(body.isHighlighted),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      parentId: body.parentId || null
    }
  });

  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const updateData: any = {};

  if (body.label !== undefined) updateData.label = body.label.trim();
  if (body.url !== undefined) updateData.url = body.url.trim();
  if (body.location !== undefined) updateData.location = body.location;
  if (body.order !== undefined) updateData.order = parseInt(body.order, 10) || 0;
  if (body.target !== undefined) updateData.target = body.target;
  if (body.badge !== undefined) updateData.badge = body.badge?.trim() || null;
  if (body.badgeColor !== undefined) updateData.badgeColor = body.badgeColor?.trim() || null;
  if (body.isHighlighted !== undefined) updateData.isHighlighted = Boolean(body.isHighlighted);
  if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
  if (body.parentId !== undefined) updateData.parentId = body.parentId || null;

  const updated = await prisma.menuItem.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json(updated);
}

// Batch reorder
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const items: Array<{ id: string; order: number }> = body.items;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items payload" }, { status: 400 });
  }

  await Promise.all(
    items.map(item =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    )
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
