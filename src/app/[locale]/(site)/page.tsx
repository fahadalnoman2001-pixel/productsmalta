import { prisma } from "@/lib/db";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductRow from "@/components/home/ProductRow";
import BlogRow from "@/components/home/BlogRow";
import PromoStrip from "@/components/home/PromoStrip";
import TripleBanner from "@/components/home/TripleBanner";
import MiddleBanner from "@/components/home/MiddleBanner";
import DoubleBanner from "@/components/home/DoubleBanner";
import { Locale, isValidLocale, getHreflangMetadata, LOCALE_OG } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);

  const titles: Record<Locale, string> = {
    en: "YourOffers.eu — Curated Deals & Buying Guides Across Europe",
    de: "YourOffers.eu — Kuratierte Angebote & Kaufratgeber in ganz Europa",
    fr: "YourOffers.eu — Offres Sélectionnées & Guides d'Achat en Europe",
    es: "YourOffers.eu — Ofertas Seleccionadas y Guías de Compra en Europa"
  };

  const descriptions: Record<Locale, string> = {
    en: "Discover the best curated affiliate deals across Europe. Compare prices on electronics, fashion, home & beauty — handpicked and updated daily on YourOffers.eu.",
    de: "Entdecken Sie die besten kuratierten Angebote in ganz Europa. Vergleichen Sie Preise für Elektronik, Mode, Haushalt & Beauty – handverlesen auf YourOffers.eu.",
    fr: "Découvrez les meilleurs bons plans sélectionnés à travers l'Europe. Comparez les prix en électronique, mode, maison & beauté – mis à jour quotidiennement sur YourOffers.eu.",
    es: "Descubra las mejores ofertas seleccionadas en toda Europa. Compare precios de electrónica, moda, hogar y belleza: seleccionados diariamente en YourOffers.eu."
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    alternates: getHreflangMetadata("/", locale),
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: LOCALE_OG[locale]
    }
  };
}

async function getData() {
  const [
    heroBanners,
    catBanners,
    promoBanners,
    tripleBanners,
    middleBanners,
    doubleBanners,
    categories,
    homeCollections,
    topBlogs,
    categoryRows
  ] = await Promise.all([
    prisma.banner.findMany({ where: { slot: "hero", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "category", isActive: true } }),
    prisma.banner.findMany({ where: { slot: "promo", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "triple", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "middle", isActive: true }, orderBy: { order: "asc" } }),
    prisma.banner.findMany({ where: { slot: "double", isActive: true }, orderBy: { order: "asc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, take: 12 }),
    prisma.collection.findMany({
      where: { showOnHomepage: true, isActive: true },
      orderBy: { order: "asc" },
      include: {
        products: {
          include: { product: { include: { category: true } } },
          orderBy: { order: "asc" }
        }
      }
    }),
    prisma.blog.findMany({
      where: { isTop: true, isPublished: true },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: "desc" }
    }),
    prisma.category.findMany({
      where: { showOnHomepage: true },
      orderBy: { order: "asc" },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { category: true }
        }
      }
    })
  ]);
  return {
    heroBanners,
    catBanners,
    promoBanners,
    tripleBanners,
    middleBanners,
    doubleBanners,
    categories,
    homeCollections,
    topBlogs,
    categoryRows
  };
}

async function productsForCollection(col: any) {
  if (col.type === "featured")
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: 10,
      orderBy: { createdAt: "desc" }
    });
  if (col.type === "bestseller")
    return prisma.product.findMany({
      where: { isBestSeller: true, isActive: true },
      include: { category: true },
      take: 10,
      orderBy: { clicks: "desc" }
    });
  return col.products.map((cp: any) => cp.product);
}

export default async function HomePage({
  params
}: {
  params: { locale: string };
}) {
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.common;

  const d = await getData();
  const collectionRows = await Promise.all(
    d.homeCollections.map(async col => ({
      col,
      products: await productsForCollection(col)
    }))
  );

  const mid = Math.ceil(collectionRows.length / 2);
  const topRows = collectionRows.slice(0, mid);
  const bottomRows = collectionRows.slice(mid);

  return (
    <>
      <HeroSlider banners={d.heroBanners} />
      <PromoStrip banners={d.promoBanners} />

      <TripleBanner banners={d.tripleBanners} />

      <CategoryGrid categories={d.categories} banners={d.catBanners} locale={locale} />

      {topRows.map(
        ({ col, products }) =>
          products.length > 0 && (
            <ProductRow
              key={col.id}
              title={col.type === "seasonal" ? `🔥 ${col.name}` : col.name}
              subtitle={col.description || undefined}
              products={products}
              viewAll={`/collection/${col.slug}`}
              accent={col.type === "seasonal"}
              locale={locale}
            />
          )
      )}

      <MiddleBanner banner={d.middleBanners[0]} />

      {bottomRows.map(
        ({ col, products }) =>
          products.length > 0 && (
            <ProductRow
              key={col.id}
              title={col.type === "seasonal" ? `🔥 ${col.name}` : col.name}
              subtitle={col.description || undefined}
              products={products}
              viewAll={`/collection/${col.slug}`}
              accent={col.type === "seasonal"}
              locale={locale}
            />
          )
      )}

      <DoubleBanner banners={d.doubleBanners} />

      {d.categoryRows.map(
        c =>
          c.products.length > 0 && (
            <ProductRow
              key={c.id}
              title={c.name}
              subtitle={`${t.latestIn} ${c.name}`}
              products={c.products}
              viewAll={`/category/${c.slug}`}
              locale={locale}
            />
          )
      )}

      <BlogRow blogs={d.topBlogs} locale={locale} />
    </>
  );
}
