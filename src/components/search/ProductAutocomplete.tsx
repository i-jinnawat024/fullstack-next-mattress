"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

const SEARCH_DEBOUNCE_MS = 200;
const LIMIT = 15;

export function ProductAutocomplete({
  onSelect,
  placeholder,
}: {
  onSelect: (product: Product) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), limit: String(LIMIT) });
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.products ?? []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => fetchResults(query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor="autocomplete-search" className="sr-only">
        ค้นหารุ่นหรือแบรนด์
      </label>
      <input
        id="autocomplete-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder ?? "พิมพ์ชื่อรุ่นหรือแบรนด์..."}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        aria-expanded={open}
        aria-controls="autocomplete-list"
        aria-autocomplete="list"
        role="combobox"
      />
      <div
        id="autocomplete-list"
        role="listbox"
        className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[70vh] overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg md:max-w-xl"
      >
        {loading && (
          <div className="py-6 text-center text-[var(--color-text-muted)]" aria-live="polite">
            กำลังค้นหา...
          </div>
        )}
        {!loading && open && results.length === 0 && query.trim() && (
          <div className="py-6 px-4 text-center text-[var(--color-text-muted)]" role="status">
            ไม่พบรุ่นที่ค้นหา ลองพิมพ์ชื่อรุ่นหรือแบรนด์
          </div>
        )}
        {!loading && results.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {results.map((p) => (
              <li key={p.id} role="option">
                <button
                  type="button"
                  className="w-full text-left py-3 px-4 hover:bg-[var(--color-surface-secondary)] focus:bg-[var(--color-surface-secondary)] focus:outline-none min-h-[var(--touch-min)] flex items-center"
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <ProductCard product={p} compact />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
