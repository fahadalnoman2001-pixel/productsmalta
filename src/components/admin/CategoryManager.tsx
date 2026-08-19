"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { slugify } from "@/lib/utils";
import HomepageToggle from "./HomepageToggle";

export default function CategoryManager({ cats, subs }: { cats: any[]; subs: any[] }) {
  const router = useRouter();
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState<Record<string,string>>({});

  async function addCat() {
    if (!newCat.trim()) return;
    await fetch("/api/categories", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: newCat, slug: slugify(newCat) }) });
    setNewCat(""); router.refresh();
  }
  async function delCat(id: string) {
    if (!confirm("Delete category and its subcategories?")) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    router.refresh();
  }
  async function addSub(categoryId: string) {
    const v = newSub[categoryId];
    if (!v?.trim()) return;
    await fetch("/api/categories?type=sub", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: v, slug: slugify(v), categoryId }) });
    setNewSub({ ...newSub, [categoryId]: "" }); router.refresh();
  }
  async function delSub(id: string) {
    await fetch(`/api/categories?type=sub&id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="card p-4 mb-4 flex gap-2">
        <input className="input flex-1" placeholder="New category name..." value={newCat} onChange={e => setNewCat(e.target.value)} />
        <button onClick={addCat} className="btn-primary"><Plus size={16}/> Add</button>
      </div>
      <p className="text-xs text-ink-500 mb-4">Toggle <strong>Homepage</strong> on a category to show its product row on the homepage.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cats.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.name} <span className="text-xs text-ink-400">/{c.slug}</span></div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <HomepageToggle endpoint="/api/categories" id={c.id} value={c.showOnHomepage} />
                <button onClick={() => delCat(c.id)} className="text-sale-500 hover:text-sale-600"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              {c.subcategories.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between text-sm bg-ink-50 px-2 py-1 rounded">
                  <span>{s.name}</span>
                  <button onClick={() => delSub(s.id)} className="text-sale-500 hover:text-sale-600"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input text-sm" placeholder="New subcategory..." value={newSub[c.id] || ""} onChange={e => setNewSub({...newSub, [c.id]: e.target.value})} />
              <button onClick={() => addSub(c.id)} className="btn-secondary text-xs">Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
