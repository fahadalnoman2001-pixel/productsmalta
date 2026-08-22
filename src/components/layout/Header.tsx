"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Truck,
  Tag,
  LayoutGrid,
  Flame,
  Sparkles,
  ArrowRight,
  FolderOpen
} from "lucide-react";

export default function Header({
  categories = [],
  siteName,
  menuItems = []
}: {
  categories: any[];
  siteName: string;
  menuItems?: any[];
}) {
  const [open, setOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(
    categories[0]?.id || null
  );
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  const topNav = menuItems.filter(m => m.location === "topbar" && m.isActive);
  const mainNav = menuItems.filter(m => m.location === "main" && m.isActive);

  // Check if mainNav already contains a highlighted item or "Weekend Sales"
  const hasHighlightedInMainNav = mainNav.some(
    m => m.isHighlighted || m.label.toLowerCase().includes("weekend")
  );

  const selectedCategory =
    categories.find(c => c.id === selectedCatId) || categories[0] || null;

  function getBadgeStyle(color?: string | null) {
    switch (color) {
      case "red":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xs";
      case "emerald":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs";
      case "amber":
        return "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-xs";
      case "purple":
        return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xs";
      case "slate":
        return "bg-slate-700 text-white shadow-xs";
      case "orange":
      default:
        return "bg-gradient-to-r from-brand-500 to-orange-600 text-white shadow-xs";
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Top utility strip */}
      <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800/80">
        <div className="container-x flex items-center justify-between h-8.5">
          <div className="hidden sm:flex items-center gap-5 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Truck size={12.5} className="text-brand-400" />
              <span>Curated deals delivered across Europe</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={12.5} className="text-emerald-400" />
              <span>Updated affiliate prices daily</span>
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto text-slate-300 text-[11.5px] font-medium">
            {topNav.length > 0 ? (
              topNav.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || "_self"}
                  className="hover:text-white flex items-center gap-1.5 transition"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${getBadgeStyle(
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
                <Link href="/blog" className="hover:text-white transition">
                  Blog & Guides
                </Link>
                <span className="text-slate-700">·</span>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
                <span className="text-slate-700">·</span>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main search bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-x flex items-center h-16 sm:h-17 gap-3 sm:gap-6">
          <button
            className="lg:hidden text-slate-700 hover:text-slate-900 p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group py-1">
            <img
              src="/logo.png"
              alt={siteName || "YourOffers.eu"}
              className="h-9 sm:h-11 w-auto max-w-[180px] sm:max-w-[230px] object-contain transition group-hover:opacity-95"
            />
          </Link>

          {/* Search Box */}
          <form action="/products" className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <input
                name="q"
                placeholder="Search products, top brands, categories and deals..."
                className="w-full rounded-l-xl border border-slate-200 border-r-0 pl-4 pr-3 py-2.5 text-sm bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-r-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 py-2.5 flex items-center justify-center transition-all shadow-xs"
                aria-label="Search"
              >
                <Search size={17} strokeWidth={2.2} />
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-brand-50/60 font-medium text-xs transition"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-500 flex items-center justify-center">
                <Tag size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-900 leading-tight">Deals</span>
                <span className="text-[10px] text-slate-400">All Offers</span>
              </div>
            </Link>

            <Link
              href="/blog"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-brand-50/60 font-medium text-xs transition"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-900 leading-tight">Guides</span>
                <span className="text-[10px] text-slate-400">Buying Tips</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Polished Category & Main Nav Bar with Subcategory Mega Flyout */}
      <nav className="bg-white border-b border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hidden lg:block">
        <div className="container-x flex items-center h-12 gap-2">
          {/* "All Categories" Mega Menu Trigger */}
          <div
            className="relative group shrink-0"
            onMouseEnter={() => setCatMenuOpen(true)}
            onMouseLeave={() => setCatMenuOpen(false)}
          >
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all duration-150 active:scale-98"
            >
              <LayoutGrid size={15} strokeWidth={2.2} className="text-orange-400" />
              <span>All Categories</span>
              <ChevronDown
                size={13}
                strokeWidth={2.5}
                className="group-hover:rotate-180 transition-transform duration-200 text-slate-400 group-hover:text-white"
              />
            </button>

            {/* Subcategory Flyout Mega Menu */}
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50 animate-in fade-in-50 duration-150">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex ring-1 ring-black/5 min-w-[740px] max-w-[860px] h-[480px]">
                {/* Left Column: Categories List */}
                <div className="w-[280px] border-r border-slate-100 flex flex-col justify-between bg-slate-50/50">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Categories
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                      {categories.length} total
                    </span>
                  </div>

                  <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 no-scrollbar">
                    {categories.map(c => {
                      const isSelected = selectedCategory?.id === c.id;
                      const hasSubs = c.subcategories && c.subcategories.length > 0;

                      return (
                        <div
                          key={c.id}
                          onMouseEnter={() => setSelectedCatId(c.id)}
                          className="relative"
                        >
                          <Link
                            href={`/category/${c.slug}`}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                              isSelected
                                ? "bg-white text-brand-600 shadow-xs font-semibold"
                                : "text-slate-700 hover:bg-white/80 hover:text-brand-600"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  isSelected ? "bg-brand-500 scale-125" : "bg-slate-300"
                                }`}
                              />
                              <span className="truncate">{c.name}</span>
                            </div>
                            {hasSubs && (
                              <ChevronRight
                                size={14}
                                className={`transition-all shrink-0 ${
                                  isSelected
                                    ? "text-brand-500 translate-x-0.5"
                                    : "text-slate-300"
                                }`}
                              />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-white">
                    <Link
                      href="/products"
                      className="flex items-center justify-center gap-1.5 text-center w-full py-2 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50/60 hover:bg-brand-50 rounded-xl transition"
                    >
                      <span>View All Products</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Subcategories Flyout Content */}
                <div className="flex-1 flex flex-col justify-between p-5 bg-white overflow-hidden">
                  {selectedCategory ? (
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        {/* Selected Category Header Banner */}
                        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base leading-tight">
                                {selectedCategory.name}
                              </h3>
                              {selectedCategory.subcategories?.length > 0 && (
                                <span className="text-[11px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                                  {selectedCategory.subcategories.length} subcategories
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {selectedCategory.description ||
                                `Shop top-rated deals in ${selectedCategory.name}`}
                            </p>
                          </div>
                          <Link
                            href={`/category/${selectedCategory.slug}`}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0 bg-brand-50/60 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <span>Browse All</span>
                            <ChevronRight size={13} />
                          </Link>
                        </div>

                        {/* Subcategories Grid */}
                        {selectedCategory.subcategories &&
                        selectedCategory.subcategories.length > 0 ? (
                          <div className="overflow-y-auto max-h-[320px] pr-1.5 no-scrollbar">
                            <div className="grid grid-cols-2 gap-1.5">
                              {selectedCategory.subcategories.map((sub: any) => (
                                <Link
                                  key={sub.id}
                                  href={`/category/${selectedCategory.slug}?subcategory=${sub.slug}`}
                                  className="group/sub flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-brand-50/70 border border-slate-100 hover:border-brand-100 font-medium text-[12.5px] transition-all"
                                >
                                  <span className="truncate">{sub.name}</span>
                                  <ChevronRight
                                    size={13}
                                    className="text-slate-300 group-hover/sub:text-brand-500 group-hover/sub:translate-x-0.5 transition-all shrink-0 ml-1"
                                  />
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 text-center text-slate-400">
                            <FolderOpen size={28} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium text-slate-600">
                              Explore all products in {selectedCategory.name}
                            </p>
                            <Link
                              href={`/category/${selectedCategory.slug}`}
                              className="inline-flex items-center gap-1 mt-3 px-3.5 py-1.5 rounded-lg bg-brand-50 text-brand-600 font-semibold text-xs hover:bg-brand-100 transition"
                            >
                              <span>View Category Page</span>
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Quick Spotlight */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Tag size={13} className="text-brand-500" />
                          <span>Verified European prices & daily deals</span>
                        </span>
                        <Link
                          href={`/category/${selectedCategory.slug}`}
                          className="font-semibold text-slate-700 hover:text-brand-600"
                        >
                          All {selectedCategory.name} &rarr;
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

          {/* Main Navigation Items (No scrollbars) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 py-1">
            {mainNav.length > 0 ? (
              mainNav.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || "_self"}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[13px] font-medium transition-all shrink-0 duration-150 whitespace-nowrap ${
                    item.isHighlighted
                      ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 hover:text-red-700 border border-red-200/70 font-bold shadow-xs hover:shadow-sm"
                      : "text-slate-700 hover:text-brand-600 hover:bg-slate-100/70"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${getBadgeStyle(
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
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-brand-600 hover:bg-slate-100/70 text-[13px] font-medium transition shrink-0 whitespace-nowrap"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-brand-600 hover:bg-slate-100/70 text-[13px] font-medium transition shrink-0 whitespace-nowrap"
                >
                  All Products
                </Link>
                {categories.slice(0, 6).map(c => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-brand-600 hover:bg-slate-100/70 text-[13px] font-medium transition shrink-0 whitespace-nowrap"
                  >
                    {c.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Highlight Promo Tag (shown only if not already in mainNav) */}
          {!hasHighlightedInMainNav && (
            <div className="shrink-0 pl-2">
              <Link
                href="/collection/weekend-sales"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 hover:from-red-500/20 hover:to-amber-500/20 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200/60 shadow-xs transition-all duration-200 group whitespace-nowrap"
              >
                <Flame size={14} className="text-red-500 group-hover:scale-110 transition-transform" />
                <span>Weekend Sales</span>
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full shadow-xs">
                  HOT
                </span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer with Accordion Subcategories */}
      {open && (
        <div className="lg:hidden bg-white border-b border-slate-200 py-3 px-4 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Menu Navigation
          </div>
          <div className="space-y-1">
            {mainNav.length > 0 ? (
              mainNav.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || "_self"}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    item.isHighlighted
                      ? "bg-red-50 text-red-600 font-bold border border-red-100"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs ${getBadgeStyle(
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
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/blog"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Blog & Guides
                </Link>
                <Link
                  href="/about"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {topNav.length > 0 && (
            <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                Quick Links
              </div>
              {topNav.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target || "_self"}
                  className="block px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Categories with Subcategory Accordion on Mobile */}
          <div className="pt-3 mt-3 border-t border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              Browse Categories & Subcategories
            </div>
            <div className="space-y-1">
              {categories.map(c => {
                const isExpanded = mobileExpandedCat === c.id;
                const hasSubs = c.subcategories && c.subcategories.length > 0;

                return (
                  <div key={c.id} className="rounded-xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50/70">
                      <Link
                        href={`/category/${c.slug}`}
                        className="text-xs font-semibold text-slate-800 hover:text-brand-600 flex-1 truncate"
                        onClick={() => setOpen(false)}
                      >
                        {c.name}
                      </Link>
                      {hasSubs && (
                        <button
                          onClick={() => setMobileExpandedCat(isExpanded ? null : c.id)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          aria-label="Expand subcategories"
                        >
                          <ChevronDown
                            size={15}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-brand-600" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {hasSubs && isExpanded && (
                      <div className="p-2 bg-white grid grid-cols-2 gap-1 border-t border-slate-100">
                        {c.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={`/category/${c.slug}?subcategory=${sub.slug}`}
                            className="px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg truncate transition"
                            onClick={() => setOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
