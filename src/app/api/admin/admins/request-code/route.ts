import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendAdminCreationCode, NOTIFY_SUPER_ADMIN_EMAIL } from "@/lib/mailer";
import { logAdminAction } from "@/lib/adminLogger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentEmail = session.user.email || "system";
    const currentName = session.user.name || null;
    const body = await req.json();
    const { email, password, name, role } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existing) {
      return NextResponse.json(
        { error: `An admin with email "${cleanEmail}" already exists` },
        { status: 409 }
      );
    }

    const validRole = role === "super_admin" ? "super_admin" : role === "admin" ? "admin" : "editor";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure 10-digit numeric confirmation code
    const code = crypto.randomInt(1000000000, 9999999999).toString();

    // Invalidate any older unused codes for this target email
    await prisma.adminVerificationCode.deleteMany({
      where: { targetEmail: cleanEmail, usedAt: null }
    });

    // Extract client IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Save verification code record (expires in 10 minutes)
    const verification = await prisma.adminVerificationCode.create({
      data: {
        code,
        targetEmail: cleanEmail,
        targetName: (name || "").trim() || null,
        targetPassword: hashedPassword,
        targetRole: validRole,
        requestedBy: currentEmail,
        sentToEmail: NOTIFY_SUPER_ADMIN_EMAIL,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    // Send confirmation email via Hostinger SMTP
    await sendAdminCreationCode({
      code,
      targetEmail: cleanEmail,
      targetName: (name || "").trim() || null,
      targetRole: validRole,
      requestedBy: currentEmail,
      ip: clientIp
    });

    // Log the request in AdminLog
    await logAdminAction({
      adminEmail: currentEmail,
      adminName: currentName,
      action: "REQUEST_ADMIN_CREATION_CODE",
      details: {
        targetAdminEmail: cleanEmail,
        targetRole: validRole,
        sentTo: NOTIFY_SUPER_ADMIN_EMAIL,
        requestId: verification.id
      },
      target: `Admin: ${cleanEmail}`,
      ip: clientIp
    });

    return NextResponse.json({
      success: true,
      message: `A 10-digit confirmation code has been sent to ${NOTIFY_SUPER_ADMIN_EMAIL}`,
      requestId: verification.id,
      sentTo: NOTIFY_SUPER_ADMIN_EMAIL,
      targetEmail: cleanEmail
    });
  } catch (err: any) {
    console.error("[API Request Code Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send confirmation code" },
      { status: 500 }
    );
  }
}
