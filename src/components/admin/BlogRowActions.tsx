"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react";

export default function BlogRowActions({ id, slug, isPublished }: { id: string; slug: string; isPublished: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/blogs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !isPublished }) });
    setBusy(false); router.refresh();
  }
  async function del() {
    if (!confirm("Delete this blog?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete blog");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert("Error deleting blog: " + (err?.message || "Unknown error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/blogs/${id}`} className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 text-ink-600" title="Edit"><Pencil size={15} /></Link>
      <a href={`/blog/${slug}`} target="_blank" className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 text-ink-600" title="View live"><ExternalLink size={15} /></a>
      <button onClick={toggle} disabled={busy} className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 text-ink-600" title={isPublished ? "Unpublish" : "Publish"}>
        {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button onClick={del} disabled={busy} className="h-8 w-8 grid place-items-center rounded hover:bg-sale-50 text-sale-500" title="Delete"><Trash2 size={15} /></button>
    </div>
  );
}
