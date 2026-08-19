"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="mt-2 flex items-center gap-1 text-slate-600 hover:text-red-600">
      <LogOut size={12} /> Sign out
    </button>
  );
}
