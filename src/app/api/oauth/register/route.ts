import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// RFC 7591 Dynamic Client Registration. claude.ai calls this automatically the first
// time it connects — registration itself grants no access, it just lets the caller
// show up as a known client_id at /oauth/authorize, which still requires a super_admin
// to be logged in and approve before any token is issued.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const redirectUris: string[] = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
  if (redirectUris.length === 0) {
    return NextResponse.json({ error: "invalid_client_metadata", error_description: "redirect_uris is required" }, { status: 400 });
  }

  const clientId = "mcpc_" + crypto.randomBytes(16).toString("hex");
  await prisma.oAuthClient.create({
    data: {
      clientId,
      redirectUris: JSON.stringify(redirectUris),
      clientName: typeof body.client_name === "string" ? body.client_name : "Claude"
    }
  });

  return NextResponse.json(
    {
      client_id: clientId,
      redirect_uris: redirectUris,
      client_name: body.client_name || "Claude",
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"]
    },
    { status: 201 }
  );
}
