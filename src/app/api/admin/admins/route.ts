import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/adminLogger";

export const dynamic = "force-dynamic";

const PRIMARY_SUPER_ADMIN_EMAIL = "fahadalnoman2001@gmail.com";

// GET all admin users (sanitized)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("[API Admins GET Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

// POST: Create a new admin user
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

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: (name || "").trim() || null,
        role: validRole
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    await logAdminAction({
      adminEmail: currentEmail,
      adminName: currentName,
      action: "CREATE_ADMIN",
      details: {
        createdAdminEmail: cleanEmail,
        createdAdminName: newUser.name,
        role: validRole
      },
      target: `Admin: ${cleanEmail}`
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${cleanEmail} created successfully`,
      user: newUser
    });
  } catch (err: any) {
    console.error("[API Admins POST Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}

// PATCH: Update admin details (Email, Password, Name, Role)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentEmail = session.user.email || "system";
    const currentName = session.user.name || null;
    const body = await req.json();
    const { id, email, password, name, role } = body;

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const updateData: any = {};
    const auditChanges: Record<string, any> = {};

    // 1. Updating Name
    if (name !== undefined) {
      const cleanName = (name || "").trim() || null;
      if (cleanName !== targetUser.name) {
        updateData.name = cleanName;
        auditChanges.name = { from: targetUser.name, to: cleanName };
      }
    }

    // 2. Updating Email
    if (email !== undefined) {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
      }
      if (cleanEmail !== targetUser.email) {
        const conflict = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (conflict && conflict.id !== targetUser.id) {
          return NextResponse.json(
            { error: `Email "${cleanEmail}" is already in use by another admin` },
            { status: 409 }
          );
        }
        updateData.email = cleanEmail;
        auditChanges.email = { from: targetUser.email, to: cleanEmail };
      }
    }

    // 3. Updating Role
    if (role !== undefined) {
      const validRole = role === "super_admin" ? "super_admin" : role === "admin" ? "admin" : "editor";
      // Prevent demoting primary super admin
      if (targetUser.email === PRIMARY_SUPER_ADMIN_EMAIL && validRole !== "super_admin") {
        return NextResponse.json(
          { error: "Primary Super Admin role cannot be demoted" },
          { status: 403 }
        );
      }
      if (validRole !== targetUser.role) {
        updateData.role = validRole;
        auditChanges.role = { from: targetUser.role, to: validRole };
      }
    }

    // 4. Updating Password
    let passwordChanged = false;
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password.trim(), 10);
      passwordChanged = true;
      auditChanges.password = "PASSWORD_CHANGED";
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes requested", user: targetUser });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    await logAdminAction({
      adminEmail: currentEmail,
      adminName: currentName,
      action: passwordChanged ? "CHANGE_ADMIN_PASSWORD" : "UPDATE_ADMIN_DETAILS",
      details: auditChanges,
      target: `Admin: ${targetUser.email}`
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${updatedUser.email} updated successfully`,
      user: updatedUser
    });
  } catch (err: any) {
    console.error("[API Admins PATCH Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update admin" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an admin user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentEmail = session.user.email || "system";
    const currentName = session.user.name || null;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Protection rule 1: Cannot delete primary super admin
    if (targetUser.email === PRIMARY_SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Cannot delete the primary Super Admin account" },
        { status: 403 }
      );
    }

    // Protection rule 2: Cannot delete yourself while logged in
    if (targetUser.email === currentEmail) {
      return NextResponse.json(
        { error: "You cannot delete your own logged-in admin account" },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });

    await logAdminAction({
      adminEmail: currentEmail,
      adminName: currentName,
      action: "DELETE_ADMIN",
      details: {
        deletedAdminId: id,
        deletedAdminEmail: targetUser.email,
        deletedAdminName: targetUser.name,
        deletedAdminRole: targetUser.role
      },
      target: `Admin: ${targetUser.email}`
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${targetUser.email} deleted successfully`
    });
  } catch (err: any) {
    console.error("[API Admins DELETE Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete admin" },
      { status: 500 }
    );
  }
}
