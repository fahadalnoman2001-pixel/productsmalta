import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone } from "lucide-react";

export default function Footer({ categories, settings }: { categories: any[]; settings: Record<string,string> }) {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="container-x py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-block mb-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-sm">
            <img src="/logo.png" alt={settings.site_name || "YourOffers.eu"} className="h-8 w-auto object-contain" />
          </Link>
          <p className="text-sm text-slate-400">{settings.site_tagline || "Curated Deals & Buying Guides Across Europe."}</p>
          <div className="flex gap-3 mt-4">
            {settings.facebook_url && <a href={settings.facebook_url} aria-label="Facebook"><Facebook size={18} /></a>}
            {settings.instagram_url && <a href={settings.instagram_url} aria-label="Instagram"><Instagram size={18} /></a>}
            {settings.twitter_url && <a href={settings.twitter_url} aria-label="Twitter"><Twitter size={18} /></a>}
            {settings.youtube_url && <a href={settings.youtube_url} aria-label="YouTube"><Youtube size={18} /></a>}
          </div>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Categories</div>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map(c => (
              <li key={c.id}><Link href={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Contact</div>
          <ul className="space-y-2 text-sm">
            {settings.contact_email && <li className="flex items-center gap-2"><Mail size={14} /> {settings.contact_email}</li>}
            {settings.contact_phone && <li className="flex items-center gap-2"><Phone size={14} /> {settings.contact_phone}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500" suppressHydrationWarning>
        © {new Date().getFullYear()} {settings.site_name || "YourOffers.eu"}. All rights reserved.
        &nbsp;·&nbsp;Some links are affiliate links; we may earn a commission at no extra cost to you.
      </div>
    </footer>
  );
}
