"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroSlider({ banners }: { banners: any[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % Math.max(banners.length, 1)), 5000);
    return () => clearInterval(t);
  }, [banners.length]);
  if (!banners.length) return null;
  return (
    <section className="container-x pt-6">
      <div className="relative rounded-xl overflow-hidden aspect-[21/9] md:aspect-[21/7] bg-ink-100 shadow-card">
        {banners.map((b, idx) => (
          <Link key={b.id} href={b.link || "/products"} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}>
            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-6 md:px-14">
              <div className="max-w-xl text-white">
                <span className="inline-block bg-brand-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded mb-3">Featured</span>
                <h2 className="font-display text-2xl md:text-5xl font-extrabold leading-tight">{b.title}</h2>
                {b.subtitle && <p className="mt-3 text-sm md:text-lg opacity-90">{b.subtitle}</p>}
                <span className="btn-primary mt-5 inline-flex px-6 py-2.5">Shop Now →</span>
              </div>
            </div>
          </Link>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-brand-500" : "w-2 bg-white/70"}`} aria-label={`slide ${idx+1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
