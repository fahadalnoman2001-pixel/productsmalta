import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dispatch } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
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

  try {
    const body = await req.json().catch(() => ({}));
    const result = await dispatch(prisma, params.name, body || {});
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
