import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
    const { requestId, email } = body;

    const record = await prisma.adminVerificationCode.findFirst({
      where: {
        ...(requestId ? { id: requestId } : {}),
        ...(email ? { targetEmail: email.trim().toLowerCase() } : {}),
        usedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    if (!record) {
      return NextResponse.json(
        { error: "No active verification request found. Please start over." },
        { status: 404 }
      );
    }

    // Generate fresh 10-digit code
    const newCode = crypto.randomInt(1000000000, 9999999999).toString();

    // Update with new code and refreshed 10-minute expiry
    const updated = await prisma.adminVerificationCode.update({
      where: { id: record.id },
      data: {
        code: newCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    await sendAdminCreationCode({
      code: newCode,
      targetEmail: updated.targetEmail,
      targetName: updated.targetName,
      targetRole: updated.targetRole,
      requestedBy: currentEmail,
      ip: clientIp
    });

    await logAdminAction({
      adminEmail: currentEmail,
      adminName: currentName,
      action: "RESEND_ADMIN_CREATION_CODE",
      details: {
        targetAdminEmail: updated.targetEmail,
        sentTo: NOTIFY_SUPER_ADMIN_EMAIL,
        requestId: updated.id
      },
      target: `Admin: ${updated.targetEmail}`,
      ip: clientIp
    });

    return NextResponse.json({
      success: true,
      message: `A fresh 10-digit code was sent to ${NOTIFY_SUPER_ADMIN_EMAIL}`,
      requestId: updated.id
    });
  } catch (err: any) {
    console.error("[API Resend Code Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to resend confirmation code" },
      { status: 500 }
    );
  }
}
