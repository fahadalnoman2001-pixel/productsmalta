"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, Truck, Tag, Heart } from "lucide-react";

export default function Header({ categories, siteName }: { categories: any[]; siteName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40">
      {/* Top utility strip */}
      <div className="bg-ink-900 text-ink-100 text-xs">
        <div className="container-x flex items-center justify-between h-9">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1"><Truck size={13} /> Curated deals delivered across Malta</span>
            <span className="flex items-center gap-1"><Tag size={13} /> Updated affiliate prices daily</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-x flex items-center h-16 gap-4">
          <button className="lg:hidden text-ink-800" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid place-items-center h-9 w-9 rounded-md bg-brand-500 text-white font-display font-extrabold">P</span>
            <span className="font-display font-extrabold text-lg leading-none text-ink-900 hidden sm:block">
              {siteName.split(" ").map((w, i) => <span key={i} className={i === 0 ? "" : "text-brand-500"}>{w} </span>)}
            </span>
          </Link>

          <form action="/products" className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex">
              <input name="q" placeholder="Search products, brands and categories..." className="w-full rounded-l-md border border-ink-200 border-r-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <button className="rounded-r-md bg-brand-500 hover:bg-brand-600 text-white px-4 flex items-center" aria-label="search">
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-4 text-ink-700 shrink-0">
            <Link href="/products" className="flex flex-col items-center text-[11px] hover:text-brand-600">
              <Tag size={20} /> Deals
            </Link>
            <Link href="/blog" className="flex flex-col items-center text-[11px] hover:text-brand-600">
              <Heart size={20} /> Guides
            </Link>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="bg-white border-b border-ink-100 shadow-sm hidden lg:block">
        <div className="container-x flex items-center h-11 gap-1 text-sm">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-brand-500 text-white font-semibold px-4 h-11 -ml-4 lg:ml-0 rounded-b-none">
              <Menu size={16} /> All Categories <ChevronDown size={14} />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-hover rounded-b-lg border border-ink-100 min-w-[240px] py-2 z-50">
              {categories.map(c => (
                <Link key={c.id} href={`/products?category=${c.slug}`} className="block px-4 py-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/" className="px-3 h-11 flex items-center text-ink-700 hover:text-brand-600 font-medium">Home</Link>
          <Link href="/products" className="px-3 h-11 flex items-center text-ink-700 hover:text-brand-600 font-medium">All Products</Link>
          {categories.slice(0, 6).map(c => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="px-3 h-11 flex items-center text-ink-700 hover:text-brand-600 font-medium">
              {c.name}
            </Link>
          ))}
          <Link href="/products?collection=weekend-sales" className="px-3 h-11 flex items-center text-sale-500 hover:text-sale-600 font-semibold ml-auto">
            🔥 Weekend Sales
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-ink-100 py-3 px-4 space-y-1">
          <Link href="/" className="block py-2" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/products" className="block py-2" onClick={() => setOpen(false)}>All Products</Link>
          <Link href="/blog" className="block py-2" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/about" className="block py-2" onClick={() => setOpen(false)}>About</Link>
          <Link href="/contact" className="block py-2" onClick={() => setOpen(false)}>Contact</Link>
          <div className="pt-2 mt-2 border-t border-ink-100">
            <div className="text-xs font-semibold text-ink-500 uppercase mb-1">Categories</div>
            {categories.map(c => (
              <Link key={c.id} href={`/products?category=${c.slug}`} className="block py-2 text-sm" onClick={() => setOpen(false)}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
