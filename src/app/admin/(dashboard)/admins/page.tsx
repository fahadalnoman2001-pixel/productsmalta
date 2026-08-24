import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminManager from "@/components/admin/AdminManager";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Management | Admin Portal",
  robots: { index: false, follow: false }
};

export default async function AdminManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/admin/login");
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

  return (
    <div>
      <AdminManager
        initialUsers={JSON.parse(JSON.stringify(users))}
        currentUserEmail={session.user.email}
      />
    </div>
  );
}
