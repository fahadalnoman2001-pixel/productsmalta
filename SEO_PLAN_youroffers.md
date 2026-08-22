# YourOffers.eu — SEO Implementation Plan

**For execution with Google Antigravity**
**Repo:** `github.com/fahadalnoman2001-pixel/productsmalta`
**Live site:** https://youroffers.eu
**Framework:** Next.js 14 App Router · Prisma 5 · MySQL (Hostinger)
**Date:** 2026-08-22

---

## 0. Executive Summary — What's Broken Right Now

Audit of the live site + codebase revealed these critical SEO blockers:

| # | Issue | Impact | Priority |
|---|-------|--------|----------|
| 1 | `robots.txt` on live site points sitemap to **productsinmalta.com** (dead/wrong domain) | Google can't discover URLs | 🔴 P0 |
| 2 | `src/app/robots.ts` and `src/app/sitemap.ts` default to `productsinmalta.com` | Env fallback bug | 🔴 P0 |
| 3 | Footer default `site_name` = "Products in Malta" · About page title = "Products in Malta" · Blog meta template = "\| Products in Malta" · Product brand fallback = "Products in Malta" | Brand-signal mismatch with .eu domain | 🔴 P0 |
| 4 | Top-bar says "Curated deals delivered **across Malta**" but domain is `.eu` (Europe) | Mixed geo-targeting — Google can't rank you for either | 🔴 P0 |
| 5 | No `llms.txt` file | Missed AI-search discoverability (ChatGPT, Perplexity, Claude) | 🟠 P1 |
| 6 | Categories use `?category=slug` query params (not path-based) | Query-param URLs rank ~40% worse than clean paths | 🟠 P1 |
| 7 | No canonical URLs, no `hreflang`, no Organization / WebSite / BreadcrumbList JSON-LD | Missing eligibility for rich results & sitelinks | 🟠 P1 |
| 8 | Sitemap missing `xhtml:link` for hreflang, no `image:image` tags | Weak image SEO | 🟡 P2 |
| 9 | No dedicated category landing pages (they're just filter views) | Losing head-term rankings | 🟡 P2 |
| 10 | About page is 2 paragraphs with no E-E-A-T signals | Weak trust for affiliate site | 🟡 P2 |

---

## 1. Brand Identity — Website Name & Tagline

### Recommended Website Name
**YourOffers.eu** (keep it — exact-match domain is a rankings asset)

Style consistently across the codebase as **YourOffers.eu** (currently the code uses "YourOffer.eu" singular in metadata, "youroffers.eu" in the domain, and "Products in Malta" in about/footer fallbacks — pick ONE canonical form).

**Canonical brand string:** `YourOffers.eu` (plural, single word before `.eu`, capital Y & O)

### Tagline Options (pick one)

| # | Tagline | Best for | SEO strength |
|---|---------|----------|-------------|
| **A** ⭐ | **"Curated Deals & Buying Guides Across Europe"** | Broad EU positioning | Contains 3 target keywords: deals, buying guides, Europe |
| B | "Smart Shopping. Real Savings. Delivered Across Europe." | Emotional / conversion | Softer keywords |
| C | "The Best Affiliate Deals in Europe — Handpicked Daily" | Trust-focused | "affiliate deals Europe" head term |
| D | "Europe's Curated Deals Marketplace" | Short & memorable | Weakest keyword coverage |

**Pick A.** Use it as the H1 subtitle on homepage, in `og:description`, and in the `<title>` template.

### Meta Title Template (site-wide)

```
Homepage: YourOffers.eu — Curated Deals & Buying Guides Across Europe
Product:  {product name} — {brand} Deal | YourOffers.eu
Category: {category} Deals in Europe — Best Prices | YourOffers.eu
Blog:     {post title} | YourOffers.eu Buying Guides
```

### Meta Description Template

```
Homepage: Discover the best curated affiliate deals across Europe. Compare prices on electronics, fashion, home & beauty — updated daily on YourOffers.eu.
Product:  {product short description}. See today's price and read our full review on YourOffers.eu.
Category: Shop the best {category} deals in Europe. Handpicked products, verified retailers, updated prices daily.
```

---

## 2. Robots.txt — Full Replacement

**File to fix:** `src/app/robots.ts`

**Replace the entire file with:**

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://youroffers.eu";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/api/affiliate/",  // block affiliate redirect URLs from indexing
          "/oauth",
          "/.well-known/",
          "/*?*sort=",         // block sort/filter parameter combinations
          "/*?*page=",
          "/mcp",
          "/mcp/"
        ]
      },
      {
        userAgent: "GPTBot",
        allow: "/"              // let ChatGPT crawl for citations
      },
      {
        userAgent: "PerplexityBot",
        allow: "/"
      },
      {
        userAgent: "Google-Extended",
        allow: "/"              // opt in to Google AI Overviews
      },
      {
        userAgent: "ClaudeBot",
        allow: "/"
      },
      {
        userAgent: "CCBot",
        disallow: "/"           // block Common Crawl bulk scrapers
      },
      {
        userAgent: "anthropic-ai",
        allow: "/"
      }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
```

**Also add** `SITE_URL=https://youroffers.eu` to `.env` and to the Hostinger `preload-timestamp.js` file (per brain.md §3).

---

## 3. Sitemap.xml — Full Replacement

**File to fix:** `src/app/sitemap.ts`

**Replace entire file with:**

```ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://youroffers.eu";
  const now = new Date();

  try {
    const [products, blogs, cats, collections] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.blog.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.collection.findMany({
        where: { showOnHomepage: true },
        select: { slug: true }
      })
    ]);

    return [
      // Core pages
      { url: `${base}/`, changeFrequency: "daily", priority: 1.0, lastModified: now },
      { url: `${base}/products`, changeFrequency: "daily", priority: 0.9, lastModified: now },
      { url: `${base}/blog`, changeFrequency: "daily", priority: 0.8, lastModified: now },
      { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },

      // Category pages (once you migrate to /category/[slug] path)
      ...cats.map((c) => ({
        url: `${base}/category/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
        lastModified: now
      })),

      // Collections
      ...collections.map((c) => ({
        url: `${base}/collection/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        lastModified: now
      })),

      // Products — highest volume
      ...products.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7
      })),

      // Blog posts
      ...blogs.map((b) => ({
        url: `${base}/blog/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6
      }))
    ];
  } catch (e) {
    return [
      { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
      { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 }
    ];
  }
}
```

### Sitemap Index (for scale — do this once you have >5,000 URLs)

Create `src/app/sitemap-index.xml/route.ts` splitting into `sitemap-products.xml`, `sitemap-blog.xml`, `sitemap-categories.xml`. Not urgent — your current ~30 URLs fit in one file.

---

## 4. llms.txt — NEW File to Create

**Create:** `public/llms.txt`

```
# YourOffers.eu

> YourOffers.eu is a curated affiliate deals and buying guides platform serving shoppers across Europe. We handpick products across electronics, fashion, home, beauty, sports, and more from trusted retailers, and earn a small commission when readers buy through our links — at no extra cost to them.

## What we cover

- **Deals**: Daily-updated affiliate offers across 12 major categories
- **Buying guides**: Long-form, editorial articles helping shoppers compare products
- **Categories**: Electronics, Computers & Office, Home & Kitchen, Fashion (Women & Men), Beauty & Personal Care, Health & Wellness, Sports & Outdoor, Baby/Kids/Toys, Home Improvement & Garden, Automotive, Groceries & Pet

## Key resources

- [All Products](https://youroffers.eu/products): Full product catalog with filters
- [Buying Guides Blog](https://youroffers.eu/blog): Editorial reviews and comparisons
- [About](https://youroffers.eu/about): Our editorial standards and affiliate disclosure
- [Sitemap](https://youroffers.eu/sitemap.xml): Complete URL index

## For AI assistants

- Prices displayed are pulled from affiliate feeds and may lag by up to 24 hours — always verify at the linked retailer before quoting.
- All product recommendations are editorial picks; sponsored placements are labeled "Sponsored" in the UI.
- Affiliate disclosure appears on every product page.
- Content language: English. Target market: European Union.

## Contact

- General inquiries: via /contact page
- Business/press: same
```

Also create `public/llms-full.txt` (optional, larger) that lists every product slug with its short description — this helps LLMs cite specific SKUs. Generate it via a build script:

```ts
// scripts/generate-llms-full.ts
import { prisma } from "@/lib/db";
import fs from "fs";

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { title: true, slug: true, shortDesc: true, price: true, currency: true, brand: true }
  });
  const header = `# YourOffers.eu — Full Product Index\n\n`;
  const body = products.map(p =>
    `## ${p.title}\n- URL: https://youroffers.eu/products/${p.slug}\n- Brand: ${p.brand || "—"}\n- Price: ${p.price} ${p.currency}\n- ${p.shortDesc || ""}\n`
  ).join("\n");
  fs.writeFileSync("public/llms-full.txt", header + body);
}
main();
```

Add to `package.json` scripts: `"llms:generate": "tsx scripts/generate-llms-full.ts"` and run before every deploy.

---

## 5. Code Fixes — Metadata & Branding

### 5.1 Root layout — `src/app/layout.tsx`

Change line 6:
```ts
// OLD
title: { default: "YourOffer.eu — Curated Affiliate Deals & Buying Guides", template: "%s | YourOffer.eu" },

// NEW
title: {
  default: "YourOffers.eu — Curated Deals & Buying Guides Across Europe",
  template: "%s | YourOffers.eu"
},
```

Change line 7:
```ts
description: "Discover the best curated affiliate deals across Europe. Compare prices on electronics, fashion, home & beauty — handpicked and updated daily on YourOffers.eu.",
```

Change line 8:
```ts
metadataBase: new URL(process.env.SITE_URL || "https://youroffers.eu"),
```

Change line 18:
```ts
openGraph: {
  type: "website",
  siteName: "YourOffers.eu",
  locale: "en_EU"
}
```

Add after openGraph:
```ts
alternates: {
  canonical: "/"
},
robots: {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
},
verification: {
  google: process.env.GSC_VERIFICATION || undefined
}
```

### 5.2 Product page — `src/app/(site)/products/[slug]/page.tsx`

Line 16 — replace "Products in Malta" fallback:
```ts
// OLD
const metaTitle = p.seoTitle || `${p.title} | ${p.brand || "Products in Malta"}`;

// NEW
const metaTitle = p.seoTitle || `${p.title}${p.brand ? ` — ${p.brand}` : ""} Deal`;
```

Add canonical URL to the return object:
```ts
return {
  title: metaTitle,
  description: metaDesc,
  keywords: tags.length > 0 ? tags.join(", ") : undefined,
  alternates: { canonical: `/products/${params.slug}` },
  openGraph: { /* ... */ },
  twitter: { /* ... */ }
};
```

### 5.3 Blog page — `src/app/(site)/blog/[slug]/page.tsx`

Line 14 — replace:
```ts
// OLD
title: b.seoTitle || `${b.title} | Products in Malta`,

// NEW
title: b.seoTitle || b.title,
```
(Template will auto-append `| YourOffers.eu`.)

Add canonical inside the returned metadata:
```ts
alternates: { canonical: `/blog/${params.slug}` },
```

### 5.4 About page — `src/app/(site)/about/page.tsx`

**Rewrite entirely** (currently just 3 lines of text — huge E-E-A-T loss for an affiliate site):

```tsx
export const metadata = {
  title: "About YourOffers.eu — Our Editorial Standards & Team",
  description: "Learn how YourOffers.eu curates affiliate deals across Europe, our editorial policy, how we make money, and how you can trust our buying guides.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <div className="container-x py-10 max-w-3xl prose">
      <h1>About YourOffers.eu</h1>
      <p><strong>YourOffers.eu</strong> is a curated affiliate deals and buying guides platform serving shoppers across the European Union. We handpick products from trusted retailers across 12 major categories — electronics, fashion, home, beauty, sports and more — and update prices daily.</p>

      <h2>Our Editorial Standards</h2>
      <p>Every product on YourOffers.eu is selected by our editors based on <strong>quality, verified retailer trust, real customer reviews, and price competitiveness</strong>. We do not accept payment for editorial placement. Sponsored content, when present, is clearly labeled.</p>

      <h2>How We Make Money</h2>
      <p>YourOffers.eu is an affiliate marketing platform. When you click a "Buy Now" button and purchase a product, we may earn a small commission from the retailer — <strong>at no extra cost to you</strong>. This commission funds our editorial team and keeps the site free to use.</p>

      <h2>Our Editorial Team</h2>
      <p>[Add team bios here — even 1–2 named editors dramatically improves E-E-A-T.]</p>

      <h2>Contact</h2>
      <p>Editorial inquiries, corrections, partnership requests: <a href="/contact">contact us</a>.</p>
    </div>
  );
}
```

### 5.5 Footer — `src/components/layout/Footer.tsx`

Line 48 — change fallback:
```ts
// OLD
© {new Date().getFullYear()} {settings.site_name || "Products in Malta"}. All rights reserved.

// NEW
© {new Date().getFullYear()} {settings.site_name || "YourOffers.eu"}. All rights reserved.
```

Line 12 — same fix:
```ts
<p className="text-sm text-slate-400">{settings.site_tagline || "Curated Deals & Buying Guides Across Europe."}</p>
```

### 5.6 Header — `src/components/layout/Header.tsx`

Line 44 — fix the mixed-geo signal:
```ts
// OLD
<span className="flex items-center gap-1"><Truck size={13} /> Curated deals delivered across Malta</span>

// NEW
<span className="flex items-center gap-1"><Truck size={13} /> Curated deals delivered across Europe</span>
```

### 5.7 Update DB settings

Log into `/admin/settings` and set:
- `site_name` = `YourOffers.eu`
- `site_tagline` = `Curated Deals & Buying Guides Across Europe`
- `contact_email` = (your public support email)
- Add `gsc_verification` value (from Google Search Console — see §7)

---

## 6. URL Structure Migration — Category Pages

Currently `/products?category=electronics` → **needs to become** `/category/electronics`.

**Why:** Query-string URLs rank worse, have weaker CTR from SERPs, and can't easily target category-level keywords.

**Antigravity task:**

1. Create `src/app/(site)/category/[slug]/page.tsx` — copy the filtering logic from `products/page.tsx` but scope it to one category, with:
   - H1 = category name
   - Meta title: `{Category} Deals in Europe — Best Prices | YourOffers.eu`
   - Category description (from DB `Category.description` field)
   - Breadcrumbs
   - `ItemList` JSON-LD schema for the products displayed
2. Add 301 redirects in `middleware.ts` or `next.config.js`:
   ```js
   // next.config.js
   async redirects() {
     return [
       {
         source: '/products',
         has: [{ type: 'query', key: 'category', value: '(?<slug>.*)' }],
         destination: '/category/:slug',
         permanent: true
       }
     ];
   }
   ```
3. Update `Header.tsx` links (`?category=${c.slug}` → `/category/${c.slug}`) — lines 118, 154, 218
4. Update `Footer.tsx` links — line 24
5. Update sitemap.ts (already done in §3 above)
6. Update breadcrumb links in `products/[slug]/page.tsx` line 91

Same treatment for `/products?collection=X` → `/collection/[slug]`.

---

## 7. Structured Data (JSON-LD) — Add These

### 7.1 Organization schema (site-wide, in `layout.tsx`)

Add inside `<head>`:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "YourOffers.eu",
  "url": "https://youroffers.eu",
  "logo": "https://youroffers.eu/logo.png",
  "description": "Curated affiliate deals and buying guides across Europe.",
  "sameAs": [
    // add your social URLs
  ]
})}} />
```

### 7.2 WebSite schema with SearchAction (in `layout.tsx`)

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "YourOffers.eu",
  "url": "https://youroffers.eu",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://youroffers.eu/products?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
})}} />
```
This unlocks the sitelinks search box in Google.

### 7.3 BreadcrumbList schema — add to product/blog/category detail pages

```ts
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://youroffers.eu/" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://youroffers.eu/products" },
    { "@type": "ListItem", "position": 3, "name": p.category?.name, "item": `https://youroffers.eu/category/${p.category?.slug}` },
    { "@type": "ListItem", "position": 4, "name": p.title, "item": `https://youroffers.eu/products/${p.slug}` }
  ]
};
```

### 7.4 Product schema — enhance existing one in `products/[slug]/page.tsx`

Your current schema is decent. Add:
```ts
"sku": p.id,
"mpn": p.id,
"category": p.category?.name,
"offers": {
  ...existing,
  "priceValidUntil": new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
  "itemCondition": "https://schema.org/NewCondition",
  "seller": { "@type": "Organization", "name": p.platform || "Retailer" }
}
```

### 7.5 FAQPage schema on buying guides

For each blog post that answers questions (most buying guides do), add FAQPage JSON-LD. Adds huge SERP real-estate.

---

## 8. Content SEO Plan

### 8.1 Keyword clusters to target (EU-focused, low-competition entry points)

| Cluster | Head term | Long-tail examples | Where |
|---------|-----------|---------------------|-------|
| Electronics deals EU | "electronics deals europe" | "best cordless vacuum europe 2026", "cheapest oled tv EU" | Category + guides |
| Fashion EU | "fashion deals europe" | "winter coat deals EU shipping", "sustainable fashion brands europe" | Category + guides |
| Home & Kitchen | "kitchen gadgets europe" | "espresso machine under 300 euro" | Category + guides |
| Beauty | "beauty deals europe" | "korean skincare EU shipping" | Category + guides |
| Country modifiers | "deals in {country}" | "best deals germany", "electronics deals france" | Landing pages per country later |

### 8.2 Blog editorial calendar (first 60 days)

Publish 2 buying guides per week, 1500+ words each, using this template:

1. TL;DR box (5 lines) → captures featured snippet
2. Comparison table (Product × Price × Rating × Buy link)
3. Individual product mini-reviews (300 words each, with `Review` schema)
4. FAQ section (with FAQPage schema)
5. Verdict / editorial pick

**Priority topics** (from your project memory's viral shortlist — late-Sept/early-Oct 2026 window):
- "Best autumn heaters in Europe 2026"
- "Halloween costume deals Europe"
- "Back-to-school laptop deals under €500"
- "Best air fryers Europe 2026 buying guide"

### 8.3 Internal linking

- Every blog post → link to 3–5 related products
- Every product page → link to related buying guide (add a "Read our guide" box in `products/[slug]/page.tsx`)
- Every category page → link to 2–3 blog posts in that category
- Footer: add "Popular Guides" column with 5 top posts

---

## 9. Technical SEO — Non-Content Fixes

### 9.1 Core Web Vitals

- **Images**: replace `<img>` in `Header.tsx`, `Footer.tsx`, `ProductCard.tsx`, `blog/[slug]/page.tsx` with `next/image`. Use `sizes` and `priority` on above-the-fold images.
- **Fonts**: use `next/font/google` instead of the raw `<link>` tags in layout.tsx (saves 200-400ms LCP).
- **JS**: audit bundle with `npm run build && npx @next/bundle-analyzer`. The current `Header.tsx` is a client component when it doesn't need to be — split into `HeaderShell` (server) + `MobileMenu` (client).

### 9.2 Hreflang (if you localize later)

Not needed yet (site is English-only). When you add DE/FR/ES versions, add:
```html
<link rel="alternate" hreflang="en-eu" href="https://youroffers.eu/" />
<link rel="alternate" hreflang="de" href="https://youroffers.eu/de/" />
<link rel="alternate" hreflang="x-default" href="https://youroffers.eu/" />
```

### 9.3 Search Console + Analytics

- Verify property in Google Search Console (both `https://youroffers.eu` and the `sc-domain:youroffers.eu` versions)
- Submit sitemap: `https://youroffers.eu/sitemap.xml`
- Store verification token in DB `Setting` key `gsc_verification` (layout.tsx already reads it)
- Bing Webmaster Tools: same setup (Bing powers ChatGPT search)
- Verify GA4 is firing (already wired in layout.tsx line 34 with fallback ID `G-LP8WYSQ3VG` — confirm this is yours)

### 9.4 Broken robots.txt fix (URGENT)

The live `robots.txt` right now serves the OLD compiled version pointing to `productsinmalta.com`. After you deploy the fixed `robots.ts` (§2), verify:
```bash
curl https://youroffers.eu/robots.txt
```
Should show `Sitemap: https://youroffers.eu/sitemap.xml`.

---

## 10. Off-Page / Authority Building

Not for Antigravity — do this manually:

1. Submit to EU deals aggregators (Pepper.de, Dealabs.com, HotUKDeals, Chollometro)
2. Guest posts on 3–5 EU shopping/lifestyle blogs (target DR 30+)
3. Reddit: r/BuyItForLife, r/europe, country-specific subs — link cautiously, add value first
4. YouTube: turn your top 5 buying guides into short videos, embed back on the site
5. Digital PR: quarterly "Top X Deals in Europe" data-driven press release

---

## 11. Prioritized Execution Order for Antigravity

Hand Antigravity this exact order:

**🔴 Phase 1 — Emergency fixes (do first, deploy same day)**
1. Fix `src/app/robots.ts` default domain (§2)
2. Fix `src/app/sitemap.ts` default domain + add categories (§3)
3. Set `SITE_URL=https://youroffers.eu` env variable
4. Fix all "Products in Malta" strings in layout, footer, header, about, blog (§5.1–5.6)
5. Deploy, then `curl` verify robots.txt & sitemap.xml serve `youroffers.eu` URLs

**🟠 Phase 2 — Structural (week 1)**
6. Create `public/llms.txt` (§4)
7. Add Organization + WebSite + BreadcrumbList JSON-LD (§7.1–7.3)
8. Add canonical URLs to product & blog metadata (§5.2, §5.3)
9. Rewrite About page (§5.4)
10. Configure Search Console + submit sitemap (§9.3)

**🟡 Phase 3 — URL migration (week 2)**
11. Create `/category/[slug]` and `/collection/[slug]` routes (§6)
12. Add 301 redirects from old query-param URLs
13. Update all internal links
14. Regenerate sitemap
15. Resubmit sitemap in Search Console

**🟢 Phase 4 — Performance & content (ongoing)**
16. Migrate `<img>` → `next/image` (§9.1)
17. Add `next/font/google` for Inter + Poppins
18. Start blog editorial calendar (§8.2)
19. Add FAQPage schema to buying guides
20. Build `scripts/generate-llms-full.ts` and wire into deploy

---

## 12. Success Metrics — Track These

| Metric | Baseline (record today) | 30-day target | 90-day target |
|--------|--------|--------|--------|
| GSC impressions | ? | +200% | +500% |
| GSC clicks | ? | +150% | +400% |
| Indexed pages | ? | 100% of sitemap | 100% + rich results |
| Avg. position | ? | <30 for head terms | <15 for head terms |
| Core Web Vitals (LCP) | ? | <2.5s | <2.0s |
| Rich results eligible | 0 | Product + Article + Breadcrumb | + FAQ + SearchAction |
| Referring domains (Ahrefs) | ? | +10 | +40 |

---

## Appendix A — Files Antigravity Will Touch

```
src/app/robots.ts                             REWRITE
src/app/sitemap.ts                            REWRITE
src/app/layout.tsx                            EDIT (metadata, JSON-LD)
src/app/(site)/about/page.tsx                 REWRITE
src/app/(site)/products/[slug]/page.tsx       EDIT (metadata, canonical, schema)
src/app/(site)/blog/[slug]/page.tsx           EDIT (metadata, canonical)
src/components/layout/Header.tsx              EDIT (Malta→Europe, category links)
src/components/layout/Footer.tsx              EDIT (fallbacks, category links)
next.config.js                                EDIT (redirects)
public/llms.txt                               CREATE
public/llms-full.txt                          CREATE (via script)
scripts/generate-llms-full.ts                 CREATE
src/app/(site)/category/[slug]/page.tsx       CREATE
src/app/(site)/collection/[slug]/page.tsx    CREATE
.env                                          EDIT (SITE_URL)
```

---

## Appendix B — Prompt to give Antigravity

Copy-paste this to kick off:

> I'm handing you `SEO_PLAN_youroffers.md` for the Next.js 14 affiliate site at `H:\Aff Marketing\productsinmalta\productsinmalta`. The live site is https://youroffers.eu (deployed to Hostinger — see `brain.md` for deploy specifics). Execute Phase 1 first (§11): fix `robots.ts`, `sitemap.ts`, and every "Products in Malta" string to "YourOffers.eu", set `SITE_URL` env variable, then build the standalone bundle. Do NOT deploy yet — I'll review the diff first. Follow the exact code snippets in this plan; don't invent alternatives.
