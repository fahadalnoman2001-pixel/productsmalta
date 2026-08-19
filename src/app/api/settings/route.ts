import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json() as Record<string,string>;
  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return NextResponse.json({ ok: true });
}
