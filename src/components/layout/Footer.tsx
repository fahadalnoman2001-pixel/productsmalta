import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone } from "lucide-react";
import { Locale, getLocalizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function Footer({
  categories,
  settings,
  locale = "en"
}: {
  categories: any[];
  settings: Record<string, string>;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const t = dict.common;

  const locLink = (path: string) => getLocalizedPath(path, locale);

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="container-x py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link
            href={locLink("/")}
            className="inline-block mb-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <img
              src="/logo.png"
              alt={settings.site_name || "YourOffers.eu"}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-slate-400">
            {settings.site_tagline || t.siteTagline}
          </p>
          <div className="flex gap-3 mt-4">
            {settings.facebook_url && (
              <a href={settings.facebook_url} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook size={18} />
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
              </a>
            )}
            {settings.twitter_url && (
              <a href={settings.twitter_url} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <Youtube size={18} />
              </a>
            )}
          </div>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">{t.categories}</div>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map(c => (
              <li key={c.id}>
                <Link
                  href={locLink(`/category/${c.slug}`)}
                  className="hover:text-white transition"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">{t.company}</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={locLink("/about")} className="hover:text-white transition">
                {t.aboutUs}
              </Link>
            </li>
            <li>
              <Link href={locLink("/contact")} className="hover:text-white transition">
                {t.contact}
              </Link>
            </li>
            <li>
              <Link href={locLink("/blog")} className="hover:text-white transition">
                {t.blog}
              </Link>
            </li>
            <li>
              <Link href={locLink("/privacy")} className="hover:text-white transition">
                {t.privacyPolicy}
              </Link>
            </li>
            <li>
              <Link href={locLink("/terms")} className="hover:text-white transition">
                {t.termsOfService}
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-white transition">
                {t.sitemap}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-white font-semibold mb-3">{t.contact}</div>
          <ul className="space-y-2 text-sm">
            {settings.contact_email && (
              <li className="flex items-center gap-2">
                <Mail size={14} /> {settings.contact_email}
              </li>
            )}
            {settings.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone size={14} /> {settings.contact_phone}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div
        className="border-t border-slate-800 py-4 text-center text-xs text-slate-500"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()} {settings.site_name || "YourOffers.eu"}. {t.rightsReserved}
        &nbsp;·&nbsp;{t.affiliateDisclaimer}
      </div>
    </footer>
  );
}
