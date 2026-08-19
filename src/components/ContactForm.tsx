"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle"|"sending"|"done"|"error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending"); setError("");
    const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (r.ok) { setStatus("done"); setF({ name: "", email: "", message: "" }); }
    else { const j = await r.json().catch(() => ({})); setError(j.error || "Something went wrong."); setStatus("error"); }
  }

  if (status === "done") {
    return (
      <div className="card p-8 mt-6 text-center">
        <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
        <div className="font-semibold text-ink-900 text-lg">Thanks for reaching out!</div>
        <p className="text-ink-500 mt-1">We've received your message and will get back to you soon.</p>
        <button onClick={() => setStatus("idle")} className="btn-secondary mt-4">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 mt-6 space-y-3">
      <div><div className="label">Name</div><input className="input" value={f.name} onChange={e => setF({...f, name: e.target.value})} required /></div>
      <div><div className="label">Email</div><input type="email" className="input" value={f.email} onChange={e => setF({...f, email: e.target.value})} required /></div>
      <div><div className="label">Message</div><textarea rows={5} className="input" value={f.message} onChange={e => setF({...f, message: e.target.value})} required /></div>
      {error && <div className="text-sm text-sale-600">{error}</div>}
      <button disabled={status === "sending"} className="btn-primary">
        <Send size={15} /> {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
