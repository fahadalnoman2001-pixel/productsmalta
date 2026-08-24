import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
    const { requestId, code, email } = body;

    const cleanCode = (code || "").toString().trim().replace(/[^0-9]/g, "");
    if (!cleanCode || cleanCode.length !== 10) {
      return NextResponse.json(
        { error: "Please enter the complete 10-digit numerical confirmation code" },
        { status: 400 }
      );
    }

    // Find the verification code
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
        { error: "No active verification request found. Please request a new code." },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json(
        { error: "Confirmation code has expired (valid for 10 minutes). Please request a new code." },
        { status: 400 }
      );
    }

    // Verify code match
    if (record.code !== cleanCode) {
      return NextResponse.json(
        { error: "Invalid confirmation code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // Double check user conflict
    const existing = await prisma.user.findUnique({
      where: { email: record.targetEmail }
    });
    if (existing) {
      return NextResponse.json(
        { error: `An admin with email "${record.targetEmail}" already exists` },
        { status: 409 }
      );
    }

    // Create the verified user
    const newUser = await prisma.user.create({
      data: {
        email: record.targetEmail,
        password: record.targetPassword,
        name: record.targetName,
        role: record.targetRole
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // Mark verification code as used
    await prisma.adminVerificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    });

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Log the verified creation action
    await logAdminAction({
      adminEmail: currentEmail,
      adminName: currentName,
      action: "CREATE_ADMIN_VERIFIED_2FA",
      details: {
        createdAdminEmail: newUser.email,
        createdAdminName: newUser.name,
        role: newUser.role,
        verifiedVia: record.sentToEmail,
        codeLength: 10
      },
      target: `Admin: ${newUser.email}`,
      ip: clientIp
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${newUser.email} verified and created successfully!`,
      user: newUser
    });
  } catch (err: any) {
    console.error("[API Verify Code Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to verify confirmation code" },
      { status: 500 }
    );
  }
}
