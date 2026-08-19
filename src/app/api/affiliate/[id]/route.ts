import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const p = await prisma.product.findUnique({ where: { id: params.id } });
  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
  await Promise.all([
    prisma.product.update({ where: { id: p.id }, data: { clicks: { increment: 1 } } }),
    prisma.clickLog.create({
      data: { productId: p.id,
        ip: req.headers.get("x-forwarded-for") || "",
        userAgent: req.headers.get("user-agent") || "",
        referer: req.headers.get("referer") || "" }
    })
  ]);
  return NextResponse.redirect(p.affiliateUrl, 302);
}
