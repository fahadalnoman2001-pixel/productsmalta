import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/db";

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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { cats, s, menuItems } = await getGlobals();
  return (
    <>
      <Header
        categories={cats}
        siteName={s.site_name || "YourOffers.eu"}
        menuItems={menuItems}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={cats} settings={s} />
    </>
  );
}
