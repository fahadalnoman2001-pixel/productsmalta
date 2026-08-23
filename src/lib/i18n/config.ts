export const SUPPORTED_LOCALES = ["en", "de", "fr", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español"
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
  es: "🇪🇸"
};

export const LOCALE_OG: Record<Locale, string> = {
  en: "en_EU",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES"
};

/**
 * Checks if a string is a supported locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Normalizes any internal path (e.g. "/products" or "/de/products") to base path without locale prefix
 */
export function getBasePath(pathname: string): string {
  const clean = pathname.split("?")[0] || "/";
  for (const loc of SUPPORTED_LOCALES) {
    if (loc === DEFAULT_LOCALE) continue;
    if (clean === `/${loc}`) return "/";
    if (clean.startsWith(`/${loc}/`)) {
      return clean.slice(loc.length + 1) || "/";
    }
  }
  if (clean.startsWith("/en/")) return clean.slice(3) || "/";
  if (clean === "/en") return "/";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

/**
 * Returns the localized URL path for a given base path and locale.
 * Default locale ("en") does NOT have a path prefix.
 * e.g., getLocalizedPath("/products", "en") -> "/products"
 *       getLocalizedPath("/products", "de") -> "/de/products"
 *       getLocalizedPath("/", "fr") -> "/fr"
 */
export function getLocalizedPath(basePath: string, locale: Locale): string {
  const path = getBasePath(basePath);
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Generates alternate language URLs for a given route path (for hreflang and sitemaps).
 */
export function getAlternateLanguageUrls(
  basePath: string,
  siteUrl: string = process.env.SITE_URL || "https://youroffers.eu"
): Record<string, string> {
  const path = getBasePath(basePath);
  const normalizedBase = siteUrl.replace(/\/+$/, "");

  const enUrl = path === "/" ? `${normalizedBase}/` : `${normalizedBase}${path}`;
  const deUrl = `${normalizedBase}/de${path === "/" ? "" : path}`;
  const frUrl = `${normalizedBase}/fr${path === "/" ? "" : path}`;
  const esUrl = `${normalizedBase}/es${path === "/" ? "" : path}`;

  return {
    "x-default": enUrl,
    en: enUrl,
    de: deUrl,
    fr: frUrl,
    es: esUrl
  };
}

/**
 * Generates the complete Next.js `alternates` metadata object for a page.
 */
export function getHreflangMetadata(
  basePath: string,
  currentLocale: Locale = DEFAULT_LOCALE,
  siteUrl: string = process.env.SITE_URL || "https://youroffers.eu"
) {
  const normalizedBase = siteUrl.replace(/\/+$/, "");
  const localizedPath = getLocalizedPath(basePath, currentLocale);
  const canonicalUrl =
    localizedPath === "/"
      ? `${normalizedBase}/`
      : `${normalizedBase}${localizedPath}`;

  return {
    canonical: canonicalUrl,
    languages: getAlternateLanguageUrls(basePath, siteUrl)
  };
}
