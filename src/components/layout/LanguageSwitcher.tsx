"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Globe, ChevronDown, Check } from "lucide-react";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  LOCALE_FLAGS,
  Locale,
  getLocalizedPath,
  getBasePath
} from "@/lib/i18n/config";

export default function LanguageSwitcher({
  currentLocale = "en",
  variant = "desktop"
}: {
  currentLocale?: Locale;
  variant?: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const basePath = getBasePath(pathname);
  const queryString = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  if (variant === "mobile") {
    return (
      <div className="pt-3 border-t border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center gap-1.5">
          <Globe size={13} className="text-brand-500" />
          <span>Language / Sprache / Langue / Idioma</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SUPPORTED_LOCALES.map(loc => {
            const isSelected = loc === currentLocale;
            const targetPath = `${getLocalizedPath(basePath, loc)}${queryString}`;

            return (
              <Link
                key={loc}
                href={targetPath}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{LOCALE_FLAGS[loc]}</span>
                  <span>{LOCALE_LABELS[loc]}</span>
                </div>
                {isSelected && <Check size={14} className="text-brand-600" />}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition text-xs font-medium border border-slate-800"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span className="text-xs leading-none">{LOCALE_FLAGS[currentLocale]}</span>
        <span className="uppercase tracking-wider font-semibold text-[11px]">
          {currentLocale}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 text-slate-400 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white shadow-xl ring-1 ring-black/10 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100 text-slate-800">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center gap-1.5">
            <Globe size={11} className="text-brand-500" />
            <span>Select Language</span>
          </div>

          {SUPPORTED_LOCALES.map(loc => {
            const isSelected = loc === currentLocale;
            const targetPath = `${getLocalizedPath(basePath, loc)}${queryString}`;

            return (
              <Link
                key={loc}
                href={targetPath}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-3 py-1.5 text-xs transition ${
                  isSelected
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{LOCALE_FLAGS[loc]}</span>
                  <span>{LOCALE_LABELS[loc]}</span>
                </div>
                {isSelected && <Check size={13} className="text-brand-600" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
