"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import HomepageToggle from "./HomepageToggle";

export default function CollectionManager({ cols, products }: { cols: any[]; products: any[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [type, setType] = useState("manual");
  const [addTo, setAddTo] = useState<Record<string,string>>({});

  async function add() {
    if (!newName.trim()) return;
    await fetch("/api/collections", { method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name: newName, slug: slugify(newName), type }) });
    setNewName(""); router.refresh();
  }
  async function del(id: string) {
    if (!confirm("Delete collection?")) return;
    await fetch(`/api/collections?id=${id}`, { method: "DELETE" });
    router.refresh();
  }
  async function addProd(collectionId: string) {
    const pid = addTo[collectionId];
    if (!pid) return;
    await fetch("/api/collections/products", { method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ collectionId, productId: pid }) });
    setAddTo({ ...addTo, [collectionId]: "" }); router.refresh();
  }
  async function delProd(collectionId: string, productId: string) {
    await fetch(`/api/collections/products?collectionId=${collectionId}&productId=${productId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="card p-4 mb-4 flex gap-2 items-center">
        <input className="input flex-1" placeholder="Collection name..." value={newName} onChange={e => setNewName(e.target.value)} />
        <select className="input w-40" value={type} onChange={e => setType(e.target.value)}>
          <option value="manual">Manual</option>
          <option value="featured">Featured</option>
          <option value="bestseller">Best Seller</option>
          <option value="seasonal">Seasonal</option>
        </select>
        <button onClick={add} className="btn-primary"><Plus size={16}/> Add</button>
      </div>
      <p className="text-xs text-ink-500 mb-4">Toggle <strong>Homepage</strong> to show a collection (with its products) as a row on the homepage.</p>
      <div className="space-y-4">
        {cols.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.name} <span className="text-xs text-ink-400">/{c.slug}</span></div>
                <div className="text-xs text-ink-500">{c.type} · {c.products.length} products</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <HomepageToggle endpoint="/api/collections" id={c.id} value={c.showOnHomepage} />
                <button onClick={() => del(c.id)} className="text-sale-500 hover:text-sale-600"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {c.products.map((cp: any) => (
                <span key={cp.product.id} className="inline-flex items-center gap-1 bg-ink-100 text-xs px-2 py-1 rounded">
                  {cp.product.title}
                  <button onClick={() => delProd(c.id, cp.product.id)} className="text-sale-500"><X size={10}/></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <select className="input text-sm flex-1" value={addTo[c.id] || ""} onChange={e => setAddTo({...addTo, [c.id]: e.target.value})}>
                <option value="">Add a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <button onClick={() => addProd(c.id)} className="btn-secondary text-xs">Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
