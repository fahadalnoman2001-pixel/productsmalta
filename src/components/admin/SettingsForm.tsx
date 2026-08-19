"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ settings }: { settings: Record<string,string> }) {
  const [f, setF] = useState(settings);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function save() {
    setSaving(true);
    await fetch("/api/settings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(f) });
    setSaving(false); router.refresh(); alert("Saved");
  }
  const F = ({ k, label, ph }: { k: string; label: string; ph?: string }) => (
    <div><div className="label">{label}</div><input className="input" value={f[k] || ""} onChange={e => setF({...f, [k]: e.target.value})} placeholder={ph} /></div>
  );
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="card p-6 space-y-3">
        <div className="font-semibold">Site Info</div>
        <F k="site_name" label="Site Name" />
        <F k="site_tagline" label="Tagline" />
        <F k="contact_email" label="Contact Email" />
        <F k="contact_phone" label="Contact Phone" />
      </div>
      <div className="card p-6 space-y-3">
        <div className="font-semibold">Analytics & Tracking</div>
        <F k="ga4_id" label="Google Analytics 4 ID" ph="G-XXXXXXX" />
        <F k="gsc_verification" label="Google Search Console Verification Token" ph="abc123..." />
        <F k="meta_pixel_id" label="Meta Pixel ID" ph="1234567890" />
      </div>
      <div className="card p-6 space-y-3">
        <div className="font-semibold">Social Media</div>
        <F k="facebook_url" label="Facebook URL" />
        <F k="instagram_url" label="Instagram URL" />
        <F k="twitter_url" label="Twitter / X URL" />
        <F k="youtube_url" label="YouTube URL" />
      </div>
      <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Settings"}</button>
    </div>
  );
}
