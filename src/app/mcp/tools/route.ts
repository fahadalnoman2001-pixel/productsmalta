import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tools } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json(
      { error: "missing bearer token" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer resource_metadata="https://youroffers.eu/.well-known/oauth-protected-resource"'
        }
      }
    );
  }

  const row = await prisma.mCPToken.findUnique({ where: { token } });
  if (!row || !row.isActive) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  await prisma.mCPToken.update({ where: { id: row.id }, data: { lastUsed: new Date() } });
  return NextResponse.json({ tools });
}
