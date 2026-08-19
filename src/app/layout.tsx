import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Products in Malta — Curated Affiliate Deals & Guides", template: "%s | Products in Malta" },
  description: "Discover the best products in Malta. Handpicked affiliate deals, buying guides, and reviews across electronics, fashion, home, beauty and more.",
  metadataBase: new URL(process.env.SITE_URL || "https://productsinmalta.com"),
  openGraph: { type: "website", siteName: "Products in Malta" }
};

async function getGlobals() {
  const [cats, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.setting.findMany()
  ]);
  const s = Object.fromEntries(settings.map(x => [x.key, x.value]));
  return { cats, s };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { cats, s } = await getGlobals();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
        {s.ga4_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4_id}`}></script>
            <script dangerouslySetInnerHTML={{ __html:
              `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date()); gtag('config','${s.ga4_id}');` }}></script>
          </>
        )}
        {s.meta_pixel_id && (
          <script dangerouslySetInnerHTML={{ __html:
            `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init','${s.meta_pixel_id}'); fbq('track','PageView');` }}></script>
        )}
        {s.gsc_verification && <meta name="google-site-verification" content={s.gsc_verification} />}
      </head>
      <body>
        <Header categories={cats} siteName={s.site_name || "Products in Malta"} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer categories={cats} settings={s} />
      </body>
    </html>
  );
}
