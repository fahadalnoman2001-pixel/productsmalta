import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Award, HeartHandshake, CheckCircle2, Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "About YourOffers.eu — Our Editorial Standards & Team",
  description:
    "Learn how YourOffers.eu curates affiliate deals across Europe, our editorial policy, how we make money, and how you can trust our buying guides.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <div className="container-x py-12 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-8 md:p-12 mb-10 shadow-lg">
        <span className="bg-brand-500/40 text-brand-100 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
          Editorial Integrity & Transparency
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          About YourOffers.eu
        </h1>
        <p className="mt-3 text-brand-100 text-base md:text-lg max-w-2xl leading-relaxed">
          Your trusted guide to the finest curated deals, genuine discounts, and unbiased product comparisons across the European Union.
        </p>
      </div>

      <div className="space-y-10 text-ink-800 leading-relaxed">
        {/* Intro */}
        <section className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Award className="text-brand-600" size={22} /> Who We Are
          </h2>
          <p className="text-ink-700">
            <strong>YourOffers.eu</strong> is an independent shopping guide and curated affiliate deals platform designed to serve European shoppers. We handpick top-rated products across 12 primary categories — including Electronics, Computers & Office, Home & Kitchen, Fashion, Beauty, and Sports — from verified, reputable retailers, updating deals and prices daily.
          </p>
        </section>

        {/* Editorial Standards */}
        <section className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-ink-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={22} /> Our Editorial Standards
          </h2>
          <p className="text-ink-700 mb-4">
            Every product featured on YourOffers.eu undergoes rigorous editorial evaluation based on:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span><strong>Verified Retailer Trust:</strong> We only link to authorized, reputable merchants with reliable shipping across Europe.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span><strong>Authentic Customer Feedback:</strong> Real reviews and user satisfaction benchmarks.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span><strong>True Price Competitiveness:</strong> Verified discounts, preventing artificial price inflations.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span><strong>Independent Selection:</strong> Retailers cannot pay for positive editorial rankings or product placements.</span>
            </div>
          </div>
        </section>

        {/* How We Make Money */}
        <section className="bg-white rounded-xl border border-ink-100 p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-ink-900 mb-3 flex items-center gap-2">
            <HeartHandshake className="text-brand-600" size={22} /> Affiliate Disclosure & Transparency
          </h2>
          <p className="text-ink-700 mb-3">
            YourOffers.eu is reader-supported. When you click our outbound affiliate links and make a purchase, we may receive a small referral commission from the merchant — <strong>at zero additional cost to you</strong>.
          </p>
          <p className="text-ink-700 text-sm">
            This commission allows us to keep the site 100% free, research market trends, maintain automated price trackers, and publish in-depth buying guides.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="bg-slate-50 rounded-xl border border-slate-200 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Have Questions or Suggestions?</h3>
            <p className="text-xs text-slate-600 mt-1">Our editorial team welcomes reader feedback, corrections, and merchant inquiries.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
          >
            <Mail size={15} /> Contact Editorial Team
          </Link>
        </section>
      </div>
    </div>
  );
}
