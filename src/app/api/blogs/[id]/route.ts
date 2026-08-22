import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  delete body.id; delete body.createdAt; delete body.updatedAt; delete body.views;
  const b = await prisma.blog.update({ where: { id: params.id }, data: body });
  return NextResponse.json(b);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.blog.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, id: params.id });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete blog" }, { status: 500 });
  }
}
