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
    title: dict.privacy.metaTitle,
    description: dict.privacy.metaDesc,
    alternates: getHreflangMetadata("/privacy", locale)
  };
}

export default function PrivacyPage({
  params
}: {
  params: { locale: string };
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const p = dict.privacy;

  return (
    <div className="container-x py-10 max-w-3xl prose">
      <h1>{p.title}</h1>
      <p>{p.intro}</p>
      <h2>{p.infoCollectTitle}</h2>
      <p>{p.infoCollectText}</p>
      <h2>{p.cookiesTitle}</h2>
      <p>{p.cookiesText}</p>
      <h2>{p.affiliateTitle}</h2>
      <p>{p.affiliateText}</p>
      <h2>{p.contactTitle}</h2>
      <p>{p.contactText}</p>
    </div>
  );
}
