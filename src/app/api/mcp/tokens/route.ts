import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized — super admin required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Token name is required" }, { status: 400 });
    }

    const token = "mcp_" + crypto.randomBytes(24).toString("hex");

    // Look up user in DB or fallback gracefully
    let admin = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    if (!admin && (session?.user as any)?.id) {
      admin = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    }

    if (!admin) {
      admin = await prisma.user.findFirst({ where: { role: "super_admin" } });
    }

    const createdBy = admin?.id || "cuid_admin_fahad";

    const t = await prisma.mCPToken.create({
      data: {
        name,
        token,
        createdBy
      }
    });

    return NextResponse.json(t);
  } catch (err: any) {
    console.error("MCP token generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized — super admin required" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    await prisma.mCPToken.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("MCP token delete error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete token" },
      { status: 500 }
    );
  }
}
