import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Called when a logged-in super_admin clicks "Authorize" on /oauth/authorize.
// Issues a short-lived, single-use authorization code and redirects back to the client.
export async function POST(req: NextRequest) {
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

  const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
  if (!client) return NextResponse.json({ error: "invalid_client" }, { status: 400 });
  const allowedRedirects: string[] = JSON.parse(client.redirectUris || "[]");
  if (!allowedRedirects.includes(redirectUri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  const admin = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
  const code = "oac_" + crypto.randomBytes(24).toString("hex");
  await prisma.oAuthCode.create({
    data: {
      code,
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      adminUserId: admin!.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  });

  const url = new URL(redirectUri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  return NextResponse.redirect(url.toString(), { status: 303 });
}
