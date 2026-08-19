import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Package, Layers, Boxes, FileText, Image as ImgIcon, Settings, Terminal, LogOut } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/collections", label: "Collections", icon: Boxes },
    { href: "/admin/blogs", label: "Blogs", icon: FileText },
    { href: "/admin/banners", label: "Banners & Posters", icon: ImgIcon },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    ...(role === "super_admin" ? [{ href: "/admin/mcp", label: "MCP Server", icon: Terminal }] : [])
  ];
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 sticky top-0 h-screen">
        <Link href="/admin" className="font-display font-extrabold text-lg text-brand-700 mb-6 block">Admin Panel</Link>
        <nav className="space-y-1 text-sm">
          {nav.map(n => (
            <Link key={n.href} href={n.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              <n.icon size={16} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div>{session?.user?.email}</div>
          <div className="opacity-70">{role}</div>
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="font-semibold text-slate-800">Productsinmalta.com</div>
          <Link href="/" className="text-sm text-brand-700 hover:underline">View site →</Link>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
