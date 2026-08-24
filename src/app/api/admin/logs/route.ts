import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/adminLogger";

export const dynamic = "force-dynamic";

// GET: Paginated list of admin audit logs with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10) || 30));
    const action = searchParams.get("action")?.trim();
    const adminEmail = searchParams.get("adminEmail")?.trim();
    const search = searchParams.get("search")?.trim();

    const where: any = {};

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (adminEmail && adminEmail !== "ALL") {
      where.adminEmail = adminEmail;
    }

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { adminEmail: { contains: search } },
        { adminName: { contains: search } },
        { target: { contains: search } },
        { details: { contains: search } },
        { ip: { contains: search } }
      ];
    }

    const skip = (page - 1) * limit;

    const [total, logs, distinctActions, distinctAdmins] = await Promise.all([
      prisma.adminLog.count({ where }),
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.adminLog.findMany({
        select: { action: true },
        distinct: ["action"]
      }),
      prisma.adminLog.findMany({
        select: { adminEmail: true },
        distinct: ["adminEmail"]
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages,
      limit,
      availableActions: distinctActions.map(a => a.action),
      availableAdmins: distinctAdmins.map(a => a.adminEmail)
    });
  } catch (err: any) {
    console.error("[API Admin Logs GET Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch admin logs" },
      { status: 500 }
    );
  }
}

// DELETE: Clear logs (restricted to super_admin)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Only Super Admins can clear audit logs" },
        { status: 403 }
      );
    }

    const currentEmail = session.user.email || "system";
    const currentName = session.user.name || null;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.adminLog.delete({ where: { id } });
    } else {
      // Clear all logs
      const deleteResult = await prisma.adminLog.deleteMany({});
      await logAdminAction({
        adminEmail: currentEmail,
        adminName: currentName,
        action: "CLEAR_ALL_LOGS",
        details: { count: deleteResult.count },
        target: "AdminLog Table"
      });
    }

    return NextResponse.json({ success: true, message: "Logs cleared successfully" });
  } catch (err: any) {
    console.error("[API Admin Logs DELETE Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to clear logs" },
      { status: 500 }
    );
  }
}
