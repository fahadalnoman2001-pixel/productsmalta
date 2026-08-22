"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Terminal, Loader2, Check } from "lucide-react";

export default function MCPPanel({ tokens, mcpUrl }: { tokens: any[]; mcpUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Please enter a token name (e.g. Claude Desktop or Cursor).");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/mcp/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        alert(j.error || "Failed to generate token");
        setLoading(false);
        return;
      }

      setNewToken(j.token);
      setName("");
      router.refresh();
    } catch (err: any) {
      alert("Network error: " + (err?.message || "Failed to connect to server"));
    } finally {
      setLoading(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Are you sure you want to revoke this MCP token? Clients using it will lose access immediately.")) {
      return;
    }

    try {
      const res = await fetch(`/api/mcp/tokens?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Failed to revoke token");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert("Error revoking token: " + (err?.message || "Unknown error"));
    }
  }

  function copy(t: string, type: "url" | "token") {
    navigator.clipboard.writeText(t);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  }

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
      {/* Connection Info */}
      <div className="card p-6">
        <div className="font-semibold mb-3 text-slate-900">Connection Info</div>
        <div className="text-sm space-y-1.5 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">URL:</span>
            <span className="text-brand-700 font-bold break-all">{mcpUrl}</span>
            <button
              onClick={() => copy(mcpUrl, "url")}
              className="text-slate-400 hover:text-slate-700 p-1 transition"
              title="Copy URL"
            >
              {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="text-slate-700">
            <span className="text-slate-500">Auth:</span> Bearer token (Authorization header)
          </div>
          <div className="text-slate-700">
            <span className="text-slate-500">Persistence:</span> No expiry — connection stays alive
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-2.5">
          Runs as a separate Node process (<code>mcp-server/</code>) — see brain.md for how it's exposed on this domain.
        </div>
      </div>

      {/* Generate Token Form */}
      <div className="card p-6">
        <div className="font-semibold mb-3 text-slate-900 flex items-center gap-2">
          <Plus size={16} className="text-brand-600" /> Generate New Token
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="flex gap-2"
        >
          <input
            className="input flex-1"
            placeholder="Token name (e.g. Claude Desktop, Cursor, Agent)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>{loading ? "Generating..." : "Generate"}</span>
          </button>
        </form>

        {newToken && (
          <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Copy this token now — it won't be shown again in full:
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 bg-white p-2.5 rounded-lg border border-amber-200 text-xs font-mono break-all text-slate-800">
                {newToken}
              </code>
              <button
                onClick={() => copy(newToken, "token")}
                className="btn-secondary shrink-0 flex items-center gap-1"
              >
                {copiedToken ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700 text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Tokens Table */}
      <div className="card p-6">
        <div className="font-semibold mb-3 text-slate-900 flex items-center justify-between">
          <span>Active Tokens</span>
          <span className="text-xs text-slate-500 font-normal">{tokens.length} token(s)</span>
        </div>
        {tokens.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active MCP tokens yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs uppercase text-left border-b border-slate-100">
                <tr>
                  <th className="py-2.5 font-semibold">Name</th>
                  <th className="font-semibold">Preview</th>
                  <th className="font-semibold">Created</th>
                  <th className="font-semibold">Last Used</th>
                  <th className="text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="font-mono text-xs text-slate-600">
                      {t.token.slice(0, 10)}...{t.token.slice(-4)}
                    </td>
                    <td className="text-xs text-slate-500" suppressHydrationWarning>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-xs text-slate-500" suppressHydrationWarning>
                      {t.lastUsed ? new Date(t.lastUsed).toLocaleString() : "Never"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => del(t.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title="Revoke Token"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available MCP Tools */}
      <div className="card p-6">
        <div className="font-semibold mb-3 text-slate-900 flex items-center gap-2">
          <Terminal size={16} className="text-brand-600" /> Available MCP Tools
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {tools.map((t) => (
            <code
              key={t}
              className="bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-200/60"
            >
              {t}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
