import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function readParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => ({}));
    return j as Record<string, string>;
  }
  const form = await req.formData();
  const out: Record<string, string> = {};
  form.forEach((v, k) => (out[k] = String(v)));
  return out;
}

// RFC 6749 §4.1.3 token exchange with RFC 7636 PKCE verification.
// Success returns a real, non-expiring MCPToken as the access_token — the same kind of
// token the admin panel generates manually — so downstream auth (mcp-server's
// requireToken) doesn't need to know or care that this token came via OAuth.
export async function POST(req: NextRequest) {
  const p = await readParams(req);

  if (p.grant_type !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }
  const code = p.code || "";
  const redirectUri = p.redirect_uri || "";
  const clientId = p.client_id || "";
  const codeVerifier = p.code_verifier || "";

  const record = await prisma.oAuthCode.findUnique({ where: { code } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (record.clientId !== clientId || record.redirectUri !== redirectUri) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  const expectedChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());
  if (expectedChallenge !== record.codeChallenge) {
    return NextResponse.json({ error: "invalid_grant", error_description: "PKCE verification failed" }, { status: 400 });
  }

  // Single-use: burn the code before issuing a token.
  await prisma.oAuthCode.update({ where: { code }, data: { used: true } });

  const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
  const token = "mcp_" + crypto.randomBytes(24).toString("hex");
  await prisma.mCPToken.create({
    data: {
      name: `OAuth: ${client?.clientName || clientId} (${new Date().toISOString().slice(0, 10)})`,
      token,
      createdBy: record.adminUserId
    }
  });

  return NextResponse.json({
    access_token: token,
    token_type: "bearer",
    scope: "mcp"
  });
}
