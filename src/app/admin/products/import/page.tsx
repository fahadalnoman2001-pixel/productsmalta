"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function upload() {
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    const r = await fetch("/api/products/import", { method: "POST", headers: {"Content-Type":"text/csv"}, body: text });
    const j = await r.json();
    setResult(j); setLoading(false); router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">CSV Import</h1>
      <div className="card p-6 max-w-2xl">
        <p className="text-sm text-slate-600 mb-4">Upload a CSV with columns: <code className="bg-slate-100 px-1">title,description,price,originalPrice,brand,platform,affiliateUrl,imageUrl,categorySlug</code></p>
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
        <button onClick={upload} disabled={!file || loading} className="btn-primary">
          {loading ? "Importing..." : "Import"}
        </button>
        {result && (
          <div className="mt-4 p-3 bg-slate-50 rounded text-sm">
            <div>Imported: <strong>{result.imported}</strong></div>
            {result.errors?.length > 0 && (
              <details className="mt-2"><summary>Errors ({result.errors.length})</summary>
                <ul className="mt-2 text-xs text-red-600">{result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
