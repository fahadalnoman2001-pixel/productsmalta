import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  body.slug = body.slug || slugify(body.title);
  const created = await prisma.product.create({ data: body });
  return NextResponse.json(created);
}
