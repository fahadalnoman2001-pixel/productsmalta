import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminLogsManager from "@/components/admin/AdminLogsManager";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Logs | Admin Portal",
  robots: { index: false, follow: false }
};

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const userRole = (session.user as any)?.role;

  const [total, logs, distinctActions, distinctAdmins] = await Promise.all([
    prisma.adminLog.count(),
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25
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

  const totalPages = Math.ceil(total / 25) || 1;

  return (
    <div>
      <AdminLogsManager
        initialLogs={JSON.parse(JSON.stringify(logs))}
        initialTotal={total}
        initialPage={1}
        initialTotalPages={totalPages}
        availableActions={distinctActions.map(a => a.action)}
        availableAdmins={distinctAdmins.map(a => a.adminEmail)}
        userRole={userRole}
      />
    </div>
  );
}
