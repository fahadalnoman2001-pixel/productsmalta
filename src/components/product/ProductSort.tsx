"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ProductSort({ sort }: { sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", e.target.value);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-ink-500">Sort:</label>
      <select defaultValue={sort} onChange={onChange} className="input py-1.5 w-40">
        <option value="new">Newest</option>
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
