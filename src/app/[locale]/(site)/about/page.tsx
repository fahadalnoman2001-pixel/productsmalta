import { ShieldCheck, Award, HeartHandshake, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { Locale, isValidLocale, getHreflangMetadata, getLocalizedPath } from "@/lib/i18n/config";
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
    title: dict.about.metaTitle,
    description: dict.about.metaDesc,
    alternates: getHreflangMetadata("/about", locale)
  };
}

export default function AboutPage({
  params
}: {
  params: { locale: string };
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const a = dict.about;

  return (
    <div className="container-x py-12 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-8 md:p-12 mb-10 shadow-lg">
        <span className="bg-brand-500/40 text-brand-100 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
          {a.tag}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {a.heading}
        </h1>
        <p className="mt-3 text-brand-100 text-base md:text-lg max-w-2xl leading-relaxed">
          {a.subtitle}
        </p>
      </div>

      <div className="space-y-10 text-ink-800 leading-relaxed">
        {/* Intro */}
        <section className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Award className="text-brand-600" size={22} /> {a.whoWeAreTitle}
          </h2>
          <p className="text-ink-700">{a.whoWeAreText}</p>
        </section>

        {/* Editorial Standards */}
        <section className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-ink-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={22} /> {a.standardsTitle}
          </h2>
          <p className="text-ink-700 mb-4">{a.standardsIntro}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span>
                <strong>{a.standard1Title}:</strong> {a.standard1Desc}
              </span>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span>
                <strong>{a.standard2Title}:</strong> {a.standard2Desc}
              </span>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span>
                <strong>{a.standard3Title}:</strong> {a.standard3Desc}
              </span>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span>
                <strong>{a.standard4Title}:</strong> {a.standard4Desc}
              </span>
            </div>
          </div>
        </section>

        {/* How We Make Money */}
        <section className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-ink-900 mb-3 flex items-center gap-2">
            <HeartHandshake className="text-brand-600" size={22} /> {a.howWeMakeMoneyTitle}
          </h2>
          <p className="text-ink-700 mb-3">{a.howWeMakeMoneyP1}</p>
          <p className="text-ink-700 text-sm">{a.howWeMakeMoneyP2}</p>
        </section>

        {/* Contact CTA */}
        <section className="bg-slate-50 rounded-xl border border-slate-200 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">{a.ctaTitle}</h3>
            <p className="text-xs text-slate-600 mt-1">{a.ctaSubtitle}</p>
          </div>
          <Link
            href={getLocalizedPath("/contact", locale)}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
          >
            <Mail size={15} /> {a.ctaButton}
          </Link>
        </section>
      </div>
    </div>
  );
}
