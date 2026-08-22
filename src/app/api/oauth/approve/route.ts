import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveOrAutoRegisterClient } from "@/lib/oauthTrustedClients";
import crypto from "crypto";

// Called when a logged-in super_admin clicks "Authorize" on /oauth/authorize.
// Issues a short-lived, single-use authorization code and redirects back to the client.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || role !== "super_admin") {
      return NextResponse.json({ error: "access_denied" }, { status: 403 });
    }

    const form = await req.formData();
    const clientId = String(form.get("client_id") || "");
    const redirectUri = String(form.get("redirect_uri") || "");
    const codeChallenge = String(form.get("code_challenge") || "");
    const codeChallengeMethod = String(form.get("code_challenge_method") || "S256");
    const state = String(form.get("state") || "");

    const client = await resolveOrAutoRegisterClient(clientId, redirectUri);
    if (!client) {
      return NextResponse.json({ error: "invalid_client" }, { status: 400 });
    }

    // Resolve admin user with rock-solid fallbacks
    let admin = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    if (!admin && (session?.user as any)?.id) {
      admin = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    }

    if (!admin) {
      admin = await prisma.user.findFirst({ where: { role: "super_admin" } });
    }

    const adminUserId = admin?.id || "cuid_admin_fahad";
    const code = "oac_" + crypto.randomBytes(24).toString("hex");

    await prisma.oAuthCode.create({
      data: {
        code,
        clientId,
        redirectUri,
        codeChallenge,
        codeChallengeMethod,
        adminUserId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return NextResponse.redirect(url.toString(), { status: 303 });
  } catch (err: any) {
    console.error("OAuth approval error:", err);
    return NextResponse.json(
      { error: "server_error", error_description: err?.message || "Failed to process authorization" },
      { status: 500 }
    );
  }
}
