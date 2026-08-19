"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

/** Reusable "Show on homepage" switch for categories & collections. */
export default function HomepageToggle({ endpoint, id, value }: { endpoint: string; id: string; value: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(value);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !on;
    setOn(next);
    const r = await fetch(`${endpoint}?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHomepage: next })
    });
    if (!r.ok) setOn(!next); // revert on failure
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={toggle} disabled={busy}
      title={on ? "Showing on homepage — click to hide" : "Hidden from homepage — click to show"}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border transition ${
        on ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-ink-200 text-ink-400"}`}>
      <span className={`grid place-items-center h-4 w-4 rounded-full text-[10px] ${on ? "bg-brand-500 text-white" : "bg-ink-200 text-white"}`}>
        {on ? "✓" : ""}
      </span>
      <Home size={12} /> Homepage
    </button>
  );
}
