"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid credentials"); else router.push("/admin");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={onSubmit} className="card p-8 w-full max-w-sm">
        <div className="font-display font-extrabold text-2xl text-brand-700 mb-6">Admin Login</div>
        <div className="space-y-3">
          <div><div className="label">Email</div><input className="input" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><div className="label">Password</div><input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn-primary w-full">Sign In</button>
        </div>
        <div className="text-xs text-slate-500 mt-4 text-center">Default: admin@productsinmalta.com / ChangeMe123!</div>
      </form>
    </div>
  );
}
