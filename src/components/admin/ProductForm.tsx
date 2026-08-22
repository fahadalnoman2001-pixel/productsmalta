"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseJSON, slugify } from "@/lib/utils";

export default function ProductForm({ product, cats, subs }: { product?: any; cats: any[]; subs: any[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>(product ? {
    ...product,
    images: parseJSON<string[]>(product.images, []).join("\n"),
    tags: parseJSON<string[]>(product.tags, []).join(", ")
  } : {
    title: "", slug: "", description: "", shortDesc: "", images: "", price: 0, originalPrice: 0,
    currency: "EUR", brand: "", platform: "Amazon", affiliateUrl: "", rating: 4.5, reviewCount: 100,
    categoryId: "", subcategoryId: "", tags: "", seoTitle: "", seoDescription: "",
    isFeatured: false, isBestSeller: false, isActive: true
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = {
      ...f,
      slug: f.slug || slugify(f.title),
      images: JSON.stringify(f.images.split("\n").map((s: string) => s.trim()).filter(Boolean)),
      tags: JSON.stringify(f.tags.split(",").map((s: string) => s.trim()).filter(Boolean)),
      price: parseFloat(f.price), originalPrice: parseFloat(f.originalPrice) || null,
      rating: parseFloat(f.rating), reviewCount: parseInt(f.reviewCount),
      categoryId: f.categoryId || null, subcategoryId: f.subcategoryId || null
    };
    const method = product ? "PATCH" : "POST";
    const url = product ? `/api/products/${product.id}` : "/api/products";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) { router.push("/admin/products"); router.refresh(); }
    else alert("Save failed");
  }

  async function del() {
    if (!product || !confirm(`Are you sure you want to delete "${product.title}"? This will permanently remove it from the database.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete product from database");
        setSaving(false);
      }
    } catch (err: any) {
      alert("Error deleting product: " + (err?.message || "Unknown error"));
      setSaving(false);
    }
  }

  const availSubs = subs.filter(s => s.categoryId === f.categoryId);

  return (
    <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4 card p-6">
        <div><div className="label">Title *</div><input className="input" value={f.title || ""} onChange={e => setF({...f, title: e.target.value})} required /></div>
        <div><div className="label">Slug (auto if blank)</div><input className="input" value={f.slug || ""} onChange={e => setF({...f, slug: e.target.value})} /></div>
        <div>
          <div className="label">Short Description (Quick Overview)</div>
          <textarea rows={2} className="input" value={f.shortDesc || ""} onChange={e => setF({...f, shortDesc: e.target.value})} placeholder="Brief highlights shown at the top of the product page next to the price and Buy button..." />
        </div>
        <div>
          <div className="label">Full Description * (Detailed Overview)</div>
          <textarea rows={6} className="input" value={f.description || ""} onChange={e => setF({...f, description: e.target.value})} placeholder="Complete product features, specifications, and details shown in the Product Description section below..." required />
        </div>
        <div><div className="label">Image URLs (one per line)</div><textarea rows={4} className="input font-mono text-xs" value={f.images || ""} onChange={e => setF({...f, images: e.target.value})} placeholder="https://..." /></div>
        <div><div className="label">Tags (comma-separated)</div><input className="input" value={f.tags || ""} onChange={e => setF({...f, tags: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="label">SEO Title</div><input className="input" value={f.seoTitle || ""} onChange={e => setF({...f, seoTitle: e.target.value})} /></div>
          <div><div className="label">SEO Description</div><input className="input" value={f.seoDescription || ""} onChange={e => setF({...f, seoDescription: e.target.value})} /></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="card p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><div className="label">Price *</div><input type="number" step="0.01" className="input" value={f.price} onChange={e => setF({...f, price: e.target.value})} required /></div>
            <div><div className="label">Original Price</div><input type="number" step="0.01" className="input" value={f.originalPrice} onChange={e => setF({...f, originalPrice: e.target.value})} /></div>
          </div>
          <div><div className="label">Currency</div><input className="input" value={f.currency} onChange={e => setF({...f, currency: e.target.value})} /></div>
          <div><div className="label">Brand</div><input className="input" value={f.brand} onChange={e => setF({...f, brand: e.target.value})} /></div>
          <div><div className="label">Platform</div><input className="input" value={f.platform} onChange={e => setF({...f, platform: e.target.value})} placeholder="Amazon, eBay, etc." /></div>
          <div><div className="label">Affiliate URL *</div><input className="input" value={f.affiliateUrl} onChange={e => setF({...f, affiliateUrl: e.target.value})} required /></div>
        </div>
        <div className="card p-6 space-y-3">
          <div><div className="label">Category</div>
            <select className="input" value={f.categoryId || ""} onChange={e => setF({...f, categoryId: e.target.value, subcategoryId: ""})}>
              <option value="">—</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><div className="label">Subcategory</div>
            <select className="input" value={f.subcategoryId || ""} onChange={e => setF({...f, subcategoryId: e.target.value})}>
              <option value="">—</option>
              {availSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="label">Rating</div><input type="number" step="0.1" className="input" value={f.rating} onChange={e => setF({...f, rating: e.target.value})} /></div>
            <div><div className="label">Reviews</div><input type="number" className="input" value={f.reviewCount} onChange={e => setF({...f, reviewCount: e.target.value})} /></div>
          </div>
        </div>
        <div className="card p-6 space-y-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isActive} onChange={e => setF({...f, isActive: e.target.checked})} /> Active</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isFeatured} onChange={e => setF({...f, isFeatured: e.target.checked})} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.isBestSeller} onChange={e => setF({...f, isBestSeller: e.target.checked})} /> Best Seller</label>
        </div>
        <div className="flex gap-2">
          <button disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save"}</button>
          {product && <button type="button" onClick={del} className="btn-ghost text-red-600">Delete</button>}
        </div>
      </div>
    </form>
  );
}
