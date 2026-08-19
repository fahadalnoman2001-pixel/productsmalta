import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { name } = await req.json();
  const token = "mcp_" + crypto.randomBytes(24).toString("hex");
  const admin = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
  const t = await prisma.mCPToken.create({ data: { name, token, createdBy: admin!.id } });
  return NextResponse.json(t);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id")!;
  await prisma.mCPToken.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
