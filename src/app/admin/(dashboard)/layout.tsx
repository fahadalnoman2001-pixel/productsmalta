import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | YourOffers.eu",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1
    }
  }
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/admin/login");
  }
  const role = (session?.user as any)?.role;
  const email = session?.user?.email;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar userEmail={email} userRole={role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">YourOffers.eu Dashboard</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md transition"
          >
            <span>View live site</span>
            <span>↗</span>
          </Link>
        </header>
        <main className="p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
