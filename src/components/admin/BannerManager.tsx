"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Save, Eye, EyeOff, ExternalLink, X } from "lucide-react";

type Banner = {
  id: string; title: string; subtitle: string | null; image: string; link: string | null;
  slot: string; slotKey: string | null; order: number; isActive: boolean;
};

const SLOTS: { key: string; label: string; ratio: string; where: string; recommend: string }[] = [
  { key: "hero",        label: "Hero Slider",    ratio: "aspect-[21/7]",  where: "Top of homepage — rotates every 5s",                     recommend: "1600 × 600" },
  { key: "promo",       label: "Promo Strip",    ratio: "aspect-[21/3]",  where: "Homepage: thin promo bar under hero",                    recommend: "1600 × 220" },
  { key: "triple",      label: "Triple Poster",  ratio: "aspect-[16/10]", where: "Homepage: 3-column small posters row",                   recommend: "800 × 500" },
  { key: "double",      label: "Double Poster",  ratio: "aspect-[16/9]",  where: "Homepage: shown as a 2-up promo row",                    recommend: "800 × 450" },
  { key: "middle",      label: "Middle Banner",  ratio: "aspect-[21/5]",  where: "Homepage: full-width strip between product rows",        recommend: "1600 × 380" },
  { key: "category",    label: "Category Poster", ratio: "aspect-[4/3]",  where: "Category grid on homepage (uses Slot Key = category slug)", recommend: "800 × 600" },
  { key: "sidebar",     label: "Sidebar Poster", ratio: "aspect-[3/4]",   where: "Left sidebar on /products",                              recommend: "600 × 800" },
];

export default function BannerManager({ slot, banners, counts, categories }:
  { slot: string; banners: Banner[]; counts: Record<string, number>; categories: any[] }) {
  const router = useRouter();
  const cur = SLOTS.find(s => s.key === slot) || SLOTS[0];

  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      {/* Slot tabs */}
      <div className="flex flex-wrap gap-2 mb-5 border-b border-ink-100 pb-3 overflow-x-auto">
        {SLOTS.map(s => (
          <Link key={s.key} href={`/admin/banners?slot=${s.key}`}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
              slot === s.key ? "bg-brand-500 text-white" : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
            {s.label} <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${slot === s.key ? "bg-white/20" : "bg-ink-100"}`}>{counts[s.key] || 0}</span>
          </Link>
        ))}
      </div>

      {/* Slot info */}
      <div className="card p-4 mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-ink-900">{cur.label}</div>
          <div className="text-xs text-ink-500">{cur.where}</div>
          <div className="text-[11px] text-ink-400 mt-0.5">Recommended: {cur.recommend}</div>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary shrink-0"><Plus size={16}/> Add Banner</button>
      </div>

      {/* List */}
      {banners.length === 0 ? (
        <div className="card p-10 text-center text-ink-400">
          No banners in this slot yet. Click <strong>Add Banner</strong> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b, i) => (
            <BannerCard key={b.id} b={b} slot={cur} isFirst={i === 0} isLast={i === banners.length - 1}
              onEdit={() => setEditing(b)} onChange={() => router.refresh()} />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <BannerEditor
          banner={editing}
          slot={cur.key}
          slotLabel={cur.label}
          slotRatio={cur.ratio}
          slotRecommend={cur.recommend}
          categories={categories}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

function BannerCard({ b, slot, isFirst, isLast, onEdit, onChange }:
  { b: Banner; slot: { ratio: string }; isFirst: boolean; isLast: boolean; onEdit: () => void; onChange: () => void }) {

  async function toggle() {
    await fetch(`/api/banners?id=${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) });
    onChange();
  }
  async function move(dir: "up" | "down") {
    await fetch(`/api/banners?id=${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ __move: dir }) });
    onChange();
  }
  async function del() {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/banners?id=${b.id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="card overflow-hidden">
      <div className={`relative ${slot.ratio} bg-ink-100 overflow-hidden`}>
        <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
        {!b.isActive && <div className="absolute inset-0 bg-ink-900/60 grid place-items-center text-white font-bold">HIDDEN</div>}
        {b.subtitle && <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
          <div className="text-white">
            <div className="font-bold text-sm">{b.title}</div>
            <div className="text-xs opacity-90">{b.subtitle}</div>
          </div>
        </div>}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="font-medium text-ink-800 truncate">{b.title}</div>
            <div className="text-xs text-ink-400">
              {b.slotKey ? <>key: <code className="bg-ink-100 px-1 rounded">{b.slotKey}</code> · </> : null}
              order {b.order}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => move("up")} disabled={isFirst} className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 disabled:opacity-30" title="Move up"><ArrowUp size={15}/></button>
          <button onClick={() => move("down")} disabled={isLast} className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 disabled:opacity-30" title="Move down"><ArrowDown size={15}/></button>
          <button onClick={toggle} className={`h-8 w-8 grid place-items-center rounded hover:bg-ink-100 ${b.isActive ? "text-green-600" : "text-ink-400"}`} title={b.isActive ? "Hide" : "Show"}>
            {b.isActive ? <Eye size={15}/> : <EyeOff size={15}/>}
          </button>
          {b.link && <a href={b.link} target="_blank" className="h-8 w-8 grid place-items-center rounded hover:bg-ink-100 text-ink-600" title="Open link"><ExternalLink size={15}/></a>}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={onEdit} className="btn-secondary text-xs h-8 px-3">Edit</button>
            <button onClick={del} className="h-8 w-8 grid place-items-center rounded hover:bg-sale-50 text-sale-500" title="Delete"><Trash2 size={15}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerEditor({ banner, slot, slotLabel, slotRatio, slotRecommend, categories, onClose, onSaved }:
  { banner: Banner | null; slot: string; slotLabel: string; slotRatio: string; slotRecommend: string; categories: any[];
    onClose: () => void; onSaved: () => void }) {

  const [f, setF] = useState<any>(banner ? { ...banner } : {
    title: "", subtitle: "", image: "", link: "", slot, slotKey: "", isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (j.url) setF({ ...f, image: j.url }); else alert(j.error || "Upload failed");
    setUploading(false);
  }

  async function save() {
    if (!f.title || !f.image) { alert("Title and image are required"); return; }
    setSaving(true);
    const payload = { ...f, slot };
    const r = banner
      ? await fetch(`/api/banners?id=${banner.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/banners`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) onSaved(); else alert("Save failed");
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/50 grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-hover" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100">
          <div>
            <div className="font-display font-bold text-ink-900">{banner ? "Edit" : "New"} — {slotLabel}</div>
            <div className="text-xs text-ink-500">Recommended size: {slotRecommend}</div>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={20}/></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className={`${slotRatio} rounded-md overflow-hidden bg-ink-100 border border-ink-100`}>
            {f.image
              ? <img src={f.image} alt="preview" className="w-full h-full object-cover" />
              : <div className="w-full h-full grid place-items-center text-ink-400 text-sm">Preview appears here after you set an image</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <div className="label">Title *</div>
              <input className="input" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <div className="label">Subtitle (optional)</div>
              <input className="input" value={f.subtitle || ""} onChange={e => setF({ ...f, subtitle: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <div className="label">Image *</div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Paste an image URL or upload →" value={f.image} onChange={e => setF({ ...f, image: e.target.value })} />
                <label className="btn-secondary cursor-pointer">
                  <Upload size={14}/> {uploading ? "..." : "Upload"}
                  <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="label">Click-through Link (optional)</div>
              <input className="input" placeholder="/products?category=electronics" value={f.link || ""} onChange={e => setF({ ...f, link: e.target.value })} />
              <p className="text-[11px] text-ink-500 mt-1">Internal path (e.g. <code>/products?collection=weekend-sales</code>) or full URL.</p>
            </div>

            {slot === "category" && (
              <div className="md:col-span-2">
                <div className="label">Category (Slot Key)</div>
                <select className="input" value={f.slotKey || ""} onChange={e => setF({ ...f, slotKey: e.target.value })}>
                  <option value="">— pick a category —</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name} ({c.slug})</option>)}
                </select>
                <p className="text-[11px] text-ink-500 mt-1">This poster replaces the category's default image on the homepage.</p>
              </div>
            )}
            {slot === "triple" && (
              <div className="md:col-span-2">
                <div className="label">Badge Text</div>
                <input className="input" placeholder="e.g. Trending Deals, Special Selection, Hot Offers" value={f.slotKey || ""} onChange={e => setF({ ...f, slotKey: e.target.value })} />
                <p className="text-[11px] text-ink-500 mt-1">Shown as the orange pill in the top-left of the poster. Leave blank for no badge.</p>
              </div>
            )}
            {slot === "double" && (
              <div className="md:col-span-2">
                <div className="label">Badge Text (optional)</div>
                <input className="input" placeholder="e.g. Featured, Best of the Week" value={f.slotKey || ""} onChange={e => setF({ ...f, slotKey: e.target.value })} />
              </div>
            )}
            {slot !== "category" && slot !== "triple" && slot !== "double" && (
              <div className="md:col-span-2">
                <div className="label">Slot Key (optional)</div>
                <input className="input" placeholder="Custom tag — leave blank if unsure" value={f.slotKey || ""} onChange={e => setF({ ...f, slotKey: e.target.value })} />
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={e => setF({ ...f, isActive: e.target.checked })} /> Active (show on site)</label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-ink-100 bg-ink-50">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary"><Save size={15}/> {saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
