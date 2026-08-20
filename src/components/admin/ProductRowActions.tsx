"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, ExternalLink, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

interface ProductRowActionsProps {
  id: string;
  slug: string;
  isActive: boolean;
  title?: string;
}

export default function ProductRowActions({ id, slug, isActive, title }: ProductRowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [activeState, setActiveState] = useState(isActive);

  async function toggleActive() {
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !activeState })
      });
      if (res.ok) {
        setActiveState(!activeState);
        router.refresh();
      } else {
        alert("Failed to update product status");
      }
    } catch (e) {
      alert("An error occurred while updating status");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const confirmMessage = title
      ? `Are you sure you want to delete "${title}"? This will permanently remove it from the database.`
      : "Are you sure you want to delete this product? This will permanently remove it from the database.";

    if (!confirm(confirmMessage)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete product from database");
      }
    } catch (err: any) {
      alert("Error deleting product: " + (err?.message || "Unknown error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <a
        href={`/products/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-8 w-8 grid place-items-center rounded hover:bg-slate-100 text-slate-600 transition"
        title="View live product"
      >
        <ExternalLink size={15} />
      </a>
      <Link
        href={`/admin/products/${id}`}
        className="h-8 w-8 grid place-items-center rounded hover:bg-slate-100 text-slate-600 transition"
        title="Edit product"
      >
        <Pencil size={15} />
      </Link>
      <button
        onClick={toggleActive}
        disabled={busy}
        className="h-8 w-8 grid place-items-center rounded hover:bg-slate-100 text-slate-600 transition disabled:opacity-50"
        title={activeState ? "Deactivate (Hide)" : "Activate (Show)"}
      >
        {activeState ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="h-8 w-8 grid place-items-center rounded hover:bg-red-50 text-red-600 hover:text-red-700 transition disabled:opacity-50"
        title="Delete product"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
