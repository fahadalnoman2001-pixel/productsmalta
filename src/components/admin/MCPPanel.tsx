"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Terminal } from "lucide-react";

export default function MCPPanel({ tokens, mcpUrl }: { tokens: any[]; mcpUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState("");

  async function create() {
    if (!name.trim()) return;
    const r = await fetch("/api/mcp/tokens", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name }) });
    const j = await r.json();
    setNewToken(j.token); setName(""); router.refresh();
  }
  async function del(id: string) {
    if (!confirm("Revoke this token?")) return;
    await fetch(`/api/mcp/tokens?id=${id}`, { method: "DELETE" });
    router.refresh();
  }
  function copy(t: string) { navigator.clipboard.writeText(t); }

  const tools = [
    "list_products", "create_product", "update_product", "delete_product",
    "list_blogs", "create_blog", "update_blog", "delete_blog",
    "list_categories", "create_category", "delete_category",
    "list_collections", "create_collection", "add_product_to_collection",
    "list_banners", "create_banner", "delete_banner",
    "get_setting", "update_setting", "get_dashboard_stats"
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="font-semibold mb-3">Connection Info</div>
        <div className="text-sm space-y-1 font-mono bg-slate-50 p-3 rounded">
          <div className="flex items-center gap-2">URL: <span className="text-brand-700">{mcpUrl}</span> <button onClick={() => copy(mcpUrl)} className="text-slate-400 hover:text-slate-600"><Copy size={12}/></button></div>
          <div>Auth: Bearer token (Authorization header)</div>
          <div>Persistence: no expiry — connection stays alive</div>
        </div>
        <div className="text-xs text-slate-500 mt-2">Runs as a separate Node process (mcp-server/) — see brain.md for how it's exposed on this domain.</div>
      </div>

      <div className="card p-6">
        <div className="font-semibold mb-3 flex items-center gap-2"><Plus size={16}/> Generate New Token</div>
        <div className="flex gap-2">
          <input className="input" placeholder="Token name (e.g. Claude Desktop)" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={create} className="btn-primary">Generate</button>
        </div>
        {newToken && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-sm font-semibold text-yellow-800">Copy this token now — it won't be shown again in full:</div>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 bg-white p-2 rounded text-xs break-all">{newToken}</code>
              <button onClick={() => copy(newToken)} className="btn-secondary"><Copy size={14}/></button>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="font-semibold mb-3">Active Tokens</div>
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-xs uppercase text-left">
            <tr><th className="py-2">Name</th><th>Preview</th><th>Created</th><th>Last Used</th><th></th></tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{t.name}</td>
                <td className="font-mono text-xs">{t.token.slice(0, 10)}...{t.token.slice(-4)}</td>
                <td className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="text-xs text-slate-500">{t.lastUsed ? new Date(t.lastUsed).toLocaleString() : "Never"}</td>
                <td><button onClick={() => del(t.id)} className="text-red-500"><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <div className="font-semibold mb-3 flex items-center gap-2"><Terminal size={16}/> Available MCP Tools</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {tools.map(t => <code key={t} className="bg-slate-100 px-2 py-1 rounded text-xs">{t}</code>)}
        </div>
      </div>
    </div>
  );
}
