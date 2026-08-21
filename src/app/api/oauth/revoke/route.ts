import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// RFC 7009 Token Revocation endpoint.
// Claude may call this when a user disconnects from a connector.
// Deactivates the MCPToken so it can no longer be used.
export async function POST(req: NextRequest) {
  let params: Record<string, string> = {};

  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    params = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData();
    form.forEach((v, k) => (params[k] = String(v)));
  }

  const token = params.token || "";
  if (!token) {
    // Per RFC 7009 §2.2, the server responds with 200 even if the token is invalid
    return NextResponse.json({ ok: true });
  }

  // Optionally verify client credentials if provided
  const clientId = params.client_id || "";
  const clientSecret = params.client_secret || "";
  if (clientId) {
    const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
    if (client?.clientSecret && clientSecret !== client.clientSecret) {
      return NextResponse.json({ error: "invalid_client" }, { status: 401 });
    }
  }

  // Deactivate the token (soft-delete)
  const existing = await prisma.mCPToken.findUnique({ where: { token } });
  if (existing) {
    await prisma.mCPToken.update({
      where: { token },
      data: { isActive: false }
    });
  }

  // Per RFC 7009, always return 200
  return NextResponse.json({ ok: true });
}
