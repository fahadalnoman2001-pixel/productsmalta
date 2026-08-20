import { prisma } from "@/lib/db";
import BannerManager from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBanners({ searchParams }: { searchParams: Record<string,string> }) {
  const slot = searchParams.slot || "hero";
  const [banners, cats] = await Promise.all([
    prisma.banner.findMany({ where: { slot }, orderBy: { order: "asc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } })
  ]);
  // per-slot counts
  const counts = Object.fromEntries(
    (await prisma.banner.groupBy({ by: ["slot"], _count: { _all: true } }))
      .map((r: any) => [r.slot, r._count._all])
  );
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Banners & Posters</h1>
      <p className="text-sm text-ink-500 mb-5">Manage every image slot on the site. Toggle active, edit, reorder, upload — changes appear on the next page refresh.</p>
      <BannerManager slot={slot} banners={banners} counts={counts} categories={cats} />
    </div>
  );
}
