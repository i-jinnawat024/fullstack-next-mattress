"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Database } from "@/lib/db/schema";
import { Select } from "@/components/ui/Select";
import { ProductListClient } from "./ProductListClient";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name_asc", label: "ชื่อ A–Z" },
  { value: "name_desc", label: "ชื่อ Z–A" },
  { value: "brand_asc", label: "แบรนด์ A–Z" },
  { value: "brand_desc", label: "แบรนด์ Z–A" },
  { value: "updated_at_desc", label: "อัปเดตล่าสุด" },
  { value: "updated_at_asc", label: "อัปเดตเก่าสุด" },
];

type Props = {
  rows: ProductRow[];
  brands: string[];
};

function filterAndSort(
  rows: ProductRow[],
  params: {
    q: string;
    brand: string;
    sort: string;
  }
): ProductRow[] {
  let list = rows;

  const q = params.q.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q)
    );
  }

  if (params.brand) {
    list = list.filter((r) => r.brand === params.brand);
  }

  const [sortBy, sortDir] = params.sort.includes("_")
    ? params.sort.split("_")
    : ["name", "asc"];
  list = [...list].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "name":
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "th");
        break;
      case "brand":
        cmp = (a.brand ?? "").localeCompare(b.brand ?? "", "th");
        break;
      case "updated_at":
        cmp =
          new Date(a.updated_at ?? 0).getTime() -
          new Date(b.updated_at ?? 0).getTime();
        break;
      default:
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "th");
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  return list;
}

export function ProductsPageClient({ rows, brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const qParam = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(qParam);

  const q = searchParams.get("q") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const sort = searchParams.get("sort") ?? "name_asc";

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const filteredRows = useMemo(
    () =>
      filterAndSort(rows, {
        q,
        brand,
        sort,
      }),
    [rows, q, brand, sort]
  );

  const hasActiveFilters = q || brand;

  return (
    <div className="space-y-4" data-testid="products-page-client">
      {/* Toolbar */}
      <div
        className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-4"
        data-testid="products-toolbar"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="ค้นหาชื่อหรือแบรนด์..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => updateUrl({ q: searchInput.trim() })}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateUrl({ q: searchInput.trim() });
              }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
              data-testid="products-search"
              aria-label="ค้นหาสินค้าตามชื่อหรือแบรนด์"
            />
          </div>

          {/* Brand filter (visible on sm+) */}
          <div className="hidden sm:block sm:w-44">
            <Select
              options={brands.map((b) => ({ value: b, label: b }))}
              value={brand}
              onChange={(v) => updateUrl({ brand: v })}
              placeholder="ทุกแบรนด์"
              aria-label="กรองตามแบรนด์"
              data-testid="products-filter-brand"
            />
          </div>

          {/* Sort */}
          <div className="sm:w-52">
            <Select
              options={SORT_OPTIONS}
              value={sort}
              onChange={(v) => updateUrl({ sort: v })}
              aria-label="เรียงตาม"
              data-testid="products-sort"
            />
          </div>

          {/* Mobile: toggle filters */}
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:hidden"
            data-testid="products-filter-toggle"
            aria-expanded={showFilters}
            aria-controls="products-extra-filters"
          >
            <SlidersHorizontal className="h-5 w-5 text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text)]">ตัวกรอง</span>
          </button>
        </div>

        {/* Extra filters (mobile drawer / desktop optional row) */}
        <div
          id="products-extra-filters"
          className={`grid gap-3 border-t border-[var(--color-border)] pt-3 sm:grid-cols-2 ${showFilters ? "block" : "hidden sm:block"}`}
          data-testid="products-extra-filters"
        >
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 sm:hidden">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              แบรนด์:
            </span>
            <Select
              options={brands.map((b) => ({ value: b, label: b }))}
              value={brand}
              onChange={(v) => updateUrl({ brand: v })}
              placeholder="ทุกแบรนด์"
              size="compact"
              className="sm:hidden"
              aria-label="กรองตามแบรนด์"
              data-testid="products-filter-brand-mobile"
            />
          </div>
          {hasActiveFilters && (
            <div className="flex items-center sm:col-span-2">
              <Link
                href={pathname}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--color-primary)] hover:underline"
                data-testid="products-filter-clear"
              >
                <X className="h-4 w-4" />
                ล้างตัวกรอง
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Result count */}
      <p
        className="text-sm text-[var(--color-text-muted)]"
        data-testid="products-result-count"
      >
        {hasActiveFilters
          ? `พบ ${filteredRows.length} รายการ`
          : `ทั้งหมด ${filteredRows.length} รายการ`}
      </p>

      {/* List */}
      <ProductListClient
        rows={filteredRows}
        emptyState={
          hasActiveFilters && filteredRows.length === 0
            ? {
                message: "ไม่พบรายการที่ตรงกับตัวกรอง — ลองเปลี่ยนหรือล้างตัวกรอง",
                testId: "products-empty-filtered",
              }
            : undefined
        }
      />
    </div>
  );
}
