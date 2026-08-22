"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  FileText,
  Image as ImgIcon,
  Compass,
  Settings,
  Terminal
} from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function AdminSidebar({
  userEmail,
  userRole
}: {
  userEmail?: string | null;
  userRole?: string | null;
}) {
  const pathname = usePathname();

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/collections", label: "Collections", icon: Boxes },
    { href: "/admin/menus", label: "Menu Control", icon: Compass },
    { href: "/admin/blogs", label: "Blogs", icon: FileText },
    { href: "/admin/banners", label: "Banners & Posters", icon: ImgIcon },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    ...(userRole === "super_admin" ? [{ href: "/admin/mcp", label: "MCP Server", icon: Terminal }] : [])
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen">
      <div>
        <div className="flex items-center gap-2 mb-6 px-2">
          <Link href="/admin" className="block">
            <img src="/logo.png" alt="Admin Panel" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        <nav className="space-y-1 text-sm font-medium">
          {nav.map(n => {
            const isActive = n.exact
              ? pathname === n.href
              : pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <n.icon size={18} className={isActive ? "text-brand-600" : "text-slate-400"} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-4 px-2 space-y-2">
        <div className="text-xs">
          <div className="font-semibold text-slate-800 truncate" title={userEmail || ""}>
            {userEmail || "Admin User"}
          </div>
          <div className="text-slate-400 uppercase text-[10px] tracking-wider mt-0.5 font-bold">
            {userRole || "Editor"}
          </div>
        </div>
        <div className="pt-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
