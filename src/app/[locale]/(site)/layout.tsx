import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";
import { Locale, isValidLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

async function getGlobals() {
  const [cats, settings, menuItems] = await Promise.all([
    prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: "asc" }
        }
      },
      orderBy: { order: "asc" }
    }),
    prisma.setting.findMany(),
    prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    })
  ]);
  const s = Object.fromEntries(settings.map(x => [x.key, x.value]));
  return { cats, s, menuItems };
}

export default async function SiteLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { cats, s, menuItems } = await getGlobals();
  const rawLocale = params?.locale || "en";
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  return (
    <>
      <Header
        categories={cats}
        siteName={s.site_name || "YourOffers.eu"}
        menuItems={menuItems}
        locale={locale}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={cats} settings={s} locale={locale} />
    </>
  );
}
