import { Locale, isValidLocale, getHreflangMetadata } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);

  return {
    title: dict.terms.metaTitle,
    description: dict.terms.metaDesc,
    alternates: getHreflangMetadata("/terms", locale)
  };
}

export default function TermsPage({
  params
}: {
  params: { locale: string };
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.terms;

  return (
    <div className="container-x py-10 max-w-3xl prose">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <h2>{t.useOfSiteTitle}</h2>
      <p>{t.useOfSiteText}</p>
      <h2>{t.affiliateLinksTitle}</h2>
      <p>{t.affiliateLinksText}</p>
      <h2>{t.liabilityTitle}</h2>
      <p>{t.liabilityText}</p>
    </div>
  );
}
