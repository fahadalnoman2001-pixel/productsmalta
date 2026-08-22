"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Edit2, Upload, X, Check, Globe, Image as ImageIcon, Tag, Hash } from "lucide-react";
import { parseJSON, slugify } from "@/lib/utils";
import HomepageToggle from "./HomepageToggle";

export default function CategoryManager({ cats, subs }: { cats: any[]; subs: any[] }) {
  const router = useRouter();
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function addCat() {
    if (!newCat.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat, slug: slugify(newCat) })
    });
    setNewCat("");
    router.refresh();
  }

  async function delCat(id: string) {
    if (!confirm("Delete this category and all its subcategories? This cannot be undone.")) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function addSub(categoryId: string) {
    const v = newSub[categoryId];
    if (!v?.trim()) return;
    await fetch("/api/categories?type=sub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v, slug: slugify(v), categoryId })
    });
    setNewSub({ ...newSub, [categoryId]: "" });
    router.refresh();
  }

  async function delSub(id: string) {
    await fetch(`/api/categories?type=sub&id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  function startEditing(c: any) {
    const parsedTags = parseJSON<string[]>(c.tags, []);
    setEditingCat({
      ...c,
      tags: parsedTags.join(", "),
      image: c.image || "",
      description: c.description || "",
      seoTitle: c.seoTitle || "",
      seoDescription: c.seoDescription || "",
      order: c.order ?? 0,
      showOnHomepage: c.showOnHomepage ?? true
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (data.url) {
        setEditingCat((prev: any) => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCat) return;
    setSaving(true);
    try {
      const tagsArray = editingCat.tags
        ? editingCat.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: editingCat.name,
        slug: editingCat.slug || slugify(editingCat.name),
        description: editingCat.description || null,
        image: editingCat.image || null,
        seoTitle: editingCat.seoTitle || null,
        seoDescription: editingCat.seoDescription || null,
        tags: JSON.stringify(tagsArray),
        order: parseInt(editingCat.order) || 0,
        showOnHomepage: Boolean(editingCat.showOnHomepage)
      };

      const res = await fetch(`/api/categories?id=${editingCat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingCat(null);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to update category");
      }
    } catch (err: any) {
      alert("Error saving category: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Quick Add Bar */}
      <div className="card p-4 mb-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="New category name..."
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addCat(); }}
        />
        <button onClick={addCat} className="btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <p className="text-xs text-ink-500 mb-4">
        Click the <strong className="text-ink-700">Edit</strong> icon to configure category images, descriptions, SEO titles, descriptions, and tags. Toggle <strong>Homepage</strong> to display the category in the homepage showcase.
      </p>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cats.map(c => {
          const parsedTags = parseJSON<string[]>(c.tags, []);
          const hasImage = Boolean(c.image);
          const hasSEO = Boolean(c.seoTitle || c.seoDescription || parsedTags.length > 0);

          return (
            <div key={c.id} className="card p-4 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Category thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-ink-50 border border-ink-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-ink-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-ink-900 truncate text-base">{c.name}</div>
                      <div className="text-xs text-ink-400 font-mono truncate">/{c.slug}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <HomepageToggle endpoint="/api/categories" id={c.id} value={c.showOnHomepage} />
                    <button
                      type="button"
                      onClick={() => startEditing(c)}
                      className="p-1.5 rounded bg-ink-50 text-ink-700 hover:bg-brand-50 hover:text-brand-600 border border-ink-100 transition"
                      title="Edit Category Details & SEO"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => delCat(c.id)}
                      className="p-1.5 rounded bg-ink-50 text-sale-500 hover:bg-sale-50 hover:text-sale-600 border border-ink-100 transition"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Description & SEO badge info */}
                {(c.description || hasSEO) && (
                  <div className="mb-3 text-xs bg-ink-50/70 rounded p-2 border border-ink-100 space-y-1">
                    {c.description && (
                      <p className="text-ink-600 line-clamp-2">{c.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-500 pt-0.5">
                      {c.seoTitle && <span className="bg-white px-1.5 py-0.5 rounded border border-ink-100 font-medium">SEO Title: {c.seoTitle}</span>}
                      {parsedTags.length > 0 && (
                        <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-100 font-medium flex items-center gap-1">
                          <Tag size={10} /> {parsedTags.length} tags
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Subcategories list */}
                <div className="space-y-1 mb-3">
                  <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Subcategories ({c.subcategories.length})</div>
                  {c.subcategories.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-sm bg-ink-50 px-2.5 py-1 rounded">
                      <span className="text-ink-800 font-medium">{s.name}</span>
                      <button
                        onClick={() => delSub(s.id)}
                        className="text-ink-400 hover:text-sale-600 p-0.5"
                        title="Delete Subcategory"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add subcategory */}
              <div className="flex gap-2 pt-2 border-t border-ink-100">
                <input
                  className="input text-xs"
                  placeholder="New subcategory name..."
                  value={newSub[c.id] || ""}
                  onChange={e => setNewSub({ ...newSub, [c.id]: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") addSub(c.id); }}
                />
                <button onClick={() => addSub(c.id)} className="btn-secondary text-xs px-3">
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-ink-100">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-brand-500" />
                <h3 className="font-bold text-lg text-ink-900">Edit Category: {editingCat.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCategory} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="label">Category Name *</div>
                  <input
                    className="input"
                    value={editingCat.name}
                    onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <div className="label">Slug *</div>
                  <input
                    className="input"
                    value={editingCat.slug}
                    onChange={e => setEditingCat({ ...editingCat, slug: e.target.value })}
                    placeholder="category-slug"
                    required
                  />
                </div>
              </div>

              {/* Image and Preview */}
              <div>
                <div className="label">Category Image</div>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-lg bg-ink-50 border border-ink-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {editingCat.image ? (
                      <img src={editingCat.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-ink-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      className="input text-xs"
                      placeholder="https://example.com/image.jpg"
                      value={editingCat.image}
                      onChange={e => setEditingCat({ ...editingCat, image: e.target.value })}
                    />
                    <label className="btn-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload Category Image"}
                      <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="label">Description (Shown on Category Page & Header)</div>
                <textarea
                  rows={3}
                  className="input"
                  placeholder="Overview of products, guides and offers in this category..."
                  value={editingCat.description}
                  onChange={e => setEditingCat({ ...editingCat, description: e.target.value })}
                />
              </div>

              {/* SEO Section */}
              <div className="p-4 rounded-lg bg-ink-50 border border-ink-100 space-y-3">
                <div className="font-semibold text-ink-900 text-sm flex items-center gap-1.5">
                  <Globe size={15} className="text-brand-500" /> Category SEO Settings
                </div>
                <div>
                  <div className="label">SEO Title</div>
                  <input
                    className="input"
                    placeholder="e.g. Best Electronics Deals in Europe | Buy Online"
                    value={editingCat.seoTitle}
                    onChange={e => setEditingCat({ ...editingCat, seoTitle: e.target.value })}
                  />
                </div>
                <div>
                  <div className="label">SEO Meta Description</div>
                  <textarea
                    rows={2}
                    className="input"
                    placeholder="e.g. Discover top rated electronics, smart gadgets, laptops & accessories in Europe with the best online deals."
                    value={editingCat.seoDescription}
                    onChange={e => setEditingCat({ ...editingCat, seoDescription: e.target.value })}
                  />
                </div>
                <div>
                  <div className="label">Category SEO Tags / Keywords (comma-separated)</div>
                  <input
                    className="input"
                    placeholder="e.g. electronics, laptops, smartphones, europe, tech deals"
                    value={editingCat.tags}
                    onChange={e => setEditingCat({ ...editingCat, tags: e.target.value })}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="label">Display Order</div>
                  <input
                    type="number"
                    className="input"
                    value={editingCat.order}
                    onChange={e => setEditingCat({ ...editingCat, order: e.target.value })}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-ink-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCat.showOnHomepage}
                      onChange={e => setEditingCat({ ...editingCat, showOnHomepage: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-400 h-4 w-4"
                    />
                    Show on Homepage
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
