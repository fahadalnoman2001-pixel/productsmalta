"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseJSON, slugify } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";
import { Eye, Save, Trash2, ExternalLink } from "lucide-react";

export default function BlogForm({ blog, cats }: { blog?: any; cats: any[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>(blog ? {
    ...blog, tags: parseJSON<string[]>(blog.tags, []).join(", ")
  } : { title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "Admin", categoryId: "", tags: "",
        seoTitle: "", seoDescription: "", isPublished: true, isTop: false });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  function set(k: string, v: any) { setF((p: any) => ({ ...p, [k]: v })); }

  async function uploadCover(file: File) {
    setCoverUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (j.url) set("coverImage", j.url); else alert(j.error || "Upload failed");
    setCoverUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...f, slug: f.slug || slugify(f.title),
      tags: JSON.stringify(f.tags.split(",").map((s: string) => s.trim()).filter(Boolean)),
      categoryId: f.categoryId || null };
    const url = blog ? `/api/blogs/${blog.id}` : "/api/blogs";
    const r = await fetch(url, { method: blog ? "PATCH" : "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) { router.push("/admin/blogs"); router.refresh(); } else alert("Save failed");
  }
  async function del() {
    if (!blog || !confirm("Delete this blog?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/blogs");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete blog");
        setSaving(false);
      }
    } catch (err: any) {
      alert("Error deleting blog: " + (err?.message || "Unknown error"));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6 space-y-4">
          <div>
            <div className="label">Title *</div>
            <input className="input text-lg" value={f.title} onChange={e => set("title", e.target.value)}
              onBlur={() => { if (!f.slug && f.title) set("slug", slugify(f.title)); }} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><div className="label">Slug</div><input className="input" value={f.slug} onChange={e => set("slug", e.target.value)} placeholder="auto-generated" /></div>
            <div><div className="label">Excerpt (short summary)</div><input className="input" value={f.excerpt} onChange={e => set("excerpt", e.target.value)} /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="label mb-0">Content</div>
              <button type="button" onClick={() => setPreview(p => !p)} className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
                <Eye size={13} /> {preview ? "Back to editor" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="blog-content border border-ink-200 rounded-md px-4 py-3 min-h-[360px] bg-white"
                dangerouslySetInnerHTML={{ __html: f.content || "<p class='text-ink-400'>Nothing to preview yet.</p>" }} />
            ) : (
              <RichTextEditor value={f.content} onChange={html => set("content", html)} />
            )}
            <p className="text-[11px] text-ink-500 mt-1">Use the toolbar to add headings, lists, internal/external links, and images (by URL or upload).</p>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="font-semibold text-ink-800">SEO</div>
          <div><div className="label">SEO Title</div><input className="input" value={f.seoTitle} onChange={e => set("seoTitle", e.target.value)} placeholder={f.title} /></div>
          <div><div className="label">SEO Description</div><textarea rows={2} className="input" value={f.seoDescription} onChange={e => set("seoDescription", e.target.value)} placeholder={f.excerpt} /></div>
          <div><div className="label">Tags (comma-separated)</div><input className="input" value={f.tags} onChange={e => set("tags", e.target.value)} placeholder="guide, deals, europe" /></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-6 space-y-3">
          <div className="flex gap-2">
            <button disabled={saving} className="btn-primary flex-1"><Save size={16} /> {saving ? "Saving..." : blog ? "Update" : "Publish"}</button>
            {blog && <a href={`/blog/${blog.slug}`} target="_blank" className="btn-secondary" title="View live"><ExternalLink size={16} /></a>}
          </div>
          {blog && <button type="button" onClick={del} className="btn-ghost text-sale-600 w-full"><Trash2 size={15} /> Delete</button>}
        </div>

        <div className="card p-6 space-y-3">
          <div className="font-semibold text-ink-800">Cover Image</div>
          {f.coverImage && <img src={f.coverImage} alt="cover" className="w-full aspect-[16/9] object-cover rounded-md border border-ink-100" />}
          <input className="input" value={f.coverImage} onChange={e => set("coverImage", e.target.value)} placeholder="Image URL" />
          <label className="btn-secondary w-full cursor-pointer">
            {coverUploading ? "Uploading…" : "Upload cover"}
            <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])} />
          </label>
        </div>

        <div className="card p-6 space-y-3">
          <div><div className="label">Author</div><input className="input" value={f.author} onChange={e => set("author", e.target.value)} /></div>
          <div><div className="label">Category</div>
            <select className="input" value={f.categoryId || ""} onChange={e => set("categoryId", e.target.value)}>
              <option value="">—</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isPublished} onChange={e => set("isPublished", e.target.checked)} /> Published</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isTop} onChange={e => set("isTop", e.target.checked)} /> Feature on Homepage</label>
        </div>
      </div>
    </form>
  );
}
