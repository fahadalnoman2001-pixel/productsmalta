import "./globals.css";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

const siteBase = process.env.SITE_URL || "https://youroffers.eu";

export const metadata: Metadata = {
  title: {
    default: "YourOffers.eu — Curated Deals & Buying Guides Across Europe",
    template: "%s | YourOffers.eu"
  },
  description:
    "Discover the best curated affiliate deals across Europe. Compare prices on electronics, fashion, home & beauty — handpicked and updated daily on YourOffers.eu.",
  metadataBase: new URL(siteBase),
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico"
  },
  openGraph: {
    type: "website",
    siteName: "YourOffers.eu",
    locale: "en_EU"
  },
  verification: {
    google: process.env.GSC_VERIFICATION || undefined
  }
};

async function getTrackingSettings() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["ga4_id", "meta_pixel_id", "gsc_verification"] } }
    });
    return Object.fromEntries(settings.map(x => [x.key, x.value]));
  } catch (err) {
    return {};
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getTrackingSettings();
  const gaId = s.ga4_id || "G-LP8WYSQ3VG";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "YourOffers.eu",
    url: siteBase,
    logo: `${siteBase}/logo.png`,
    description: "Curated affiliate deals and buying guides across Europe."
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "YourOffers.eu",
    url: siteBase,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteBase}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Structured Data: Organization & WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Google tag (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `
          }}
        />

        {s.meta_pixel_id && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init','${s.meta_pixel_id}'); fbq('track','PageView');`
            }}
          />
        )}
        {s.gsc_verification && <meta name="google-site-verification" content={s.gsc_verification} />}
      </head>
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
