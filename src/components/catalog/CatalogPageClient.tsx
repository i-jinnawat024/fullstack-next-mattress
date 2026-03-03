"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { CatalogCard } from "@/components/catalog/CatalogCard";

const REFETCH_INTERVAL_MS = 60 * 1000; // 1 นาที

export function CatalogPageClient({
  products: initialProducts,
  basePath = "",
}: {
  products: Product[];
  /** เช่น "/catalog" ให้การ์ดลิงก์ไป /catalog/[id] */
  basePath?: string;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.products)) setProducts(data.products);
    } catch {
      // ล้มเหลวไม่ทำอะไร ใช้ข้อมูลเดิม
    }
  }, []);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const interval = setInterval(refetch, REFETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    const onFocus = () => refetch();
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    const tokens = q.split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      const name = (p.name ?? "").trim().toLowerCase();
      const brand = (p.brand ?? "").trim().toLowerCase();
      return tokens.every(
        (token) => name.includes(token) || brand.includes(token)
      );
    });
  }, [products, searchQuery]);

  return (
    <>
      <div className="mb-4">
        <label htmlFor="catalog-search" className="sr-only">
          ค้นชื่อรุ่นหรือแบรนด์
        </label>
        <input
          id="catalog-search"
          type="search"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นชื่อรุ่นหรือแบรนด์..."
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          data-testid="catalog-search"
        />
        {searchQuery.trim() && (
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            เจอ {filtered.length} รายการ
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-muted)]"
          data-testid="catalog-no-results"
        >
          {searchQuery.trim()
            ? "ไม่พบสินค้าที่ตรงกับคำค้นหา"
            : "ยังไม่มีสินค้าในแคตตาล็อก"}
        </div>
      ) : (
        <ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="catalog-list"
        >
          {filtered.map((product) => (
            <li key={product.id} data-testid={`catalog-card-${product.id}`}>
              <CatalogCard product={product} basePath={basePath} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
