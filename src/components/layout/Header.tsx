"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X, ChevronDown, Truck, Tag, Heart } from "lucide-react";

export default function Header({
  categories,
  siteName,
  menuItems = []
}: {
  categories: any[];
  siteName: string;
  menuItems?: any[];
}) {
  const [open, setOpen] = useState(false);

  const topNav = menuItems.filter(m => m.location === "topbar" && m.isActive);
  const mainNav = menuItems.filter(m => m.location === "main" && m.isActive);

  function getBadgeClass(color?: string | null) {
    switch (color) {
      case "red":
        return "bg-red-500 text-white";
      case "emerald":
        return "bg-emerald-500 text-white";
      case "amber":
        return "bg-amber-500 text-white";
      case "purple":
        return "bg-purple-500 text-white";
      case "slate":
        return "bg-slate-700 text-white";
      case "orange":
      default:
        return "bg-brand-500 text-white";
    }
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Top utility strip */}
      <div className="bg-ink-900 text-ink-100 text-xs">
        <div className="container-x flex items-center justify-between h-9">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1"><Truck size={13} /> Curated deals delivered across Europe</span>
            <span className="flex items-center gap-1"><Tag size={13} /> Updated affiliate prices daily</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {topNav.length > 0 ? (
              topNav.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || "_self"}
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded ${getBadgeClass(item.badgeColor)}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <>
                <Link href="/blog" className="hover:text-white">Blog</Link>
                <Link href="/about" className="hover:text-white">About</Link>
                <Link href="/contact" className="hover:text-white">Contact</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-x flex items-center h-16 gap-4">
          <button className="lg:hidden text-ink-800" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt={siteName || "YourOffers.eu"}
              className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[240px] object-contain"
            />
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
                <Link key={c.id} href={`/category/${c.slug}`} className="block px-4 py-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {mainNav.length > 0 ? (
            mainNav.map(item => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target || "_self"}
                className={`px-3 h-11 flex items-center gap-1.5 font-medium transition ${
                  item.isHighlighted
                    ? "text-sale-500 hover:text-sale-600 font-bold"
                    : "text-ink-700 hover:text-brand-600"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded shadow-xs ${getBadgeClass(
                      item.badgeColor
                    )}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))
          ) : (
            <>
              <Link href="/" className="px-3 h-11 flex items-center text-ink-700 hover:text-brand-600 font-medium">Home</Link>
              <Link href="/products" className="px-3 h-11 flex items-center text-ink-700 hover:text-brand-600 font-medium">All Products</Link>
              {categories.slice(0, 6).map(c => (
                <Link key={c.id} href={`/category/${c.slug}`} className="px-3 h-11 flex items-center text-ink-700 hover:text-brand-600 font-medium">
                  {c.name}
                </Link>
              ))}
              <Link href="/products?collection=weekend-sales" className="px-3 h-11 flex items-center text-sale-500 hover:text-sale-600 font-semibold ml-auto">
                🔥 Weekend Sales
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-ink-100 py-3 px-4 space-y-1">
          {mainNav.length > 0 ? (
            mainNav.map(item => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target || "_self"}
                className={`block py-2 flex items-center justify-between ${
                  item.isHighlighted ? "text-sale-500 font-bold" : "text-ink-800"
                }`}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getBadgeClass(item.badgeColor)}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))
          ) : (
            <>
              <Link href="/" className="block py-2" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/products" className="block py-2" onClick={() => setOpen(false)}>All Products</Link>
              <Link href="/blog" className="block py-2" onClick={() => setOpen(false)}>Blog</Link>
              <Link href="/about" className="block py-2" onClick={() => setOpen(false)}>About</Link>
              <Link href="/contact" className="block py-2" onClick={() => setOpen(false)}>Contact</Link>
            </>
          )}

          {topNav.length > 0 && (
            <div className="pt-2 mt-2 border-t border-ink-100 space-y-1">
              <div className="text-xs font-semibold text-ink-500 uppercase mb-1">Quick Links</div>
              {topNav.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || "_self"}
                  className="block py-1.5 text-sm text-ink-600 hover:text-brand-600"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-ink-100">
            <div className="text-xs font-semibold text-ink-500 uppercase mb-1">Categories</div>
            {categories.map(c => (
              <Link key={c.id} href={`/category/${c.slug}`} className="block py-2 text-sm" onClick={() => setOpen(false)}>{c.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
