"use client";

import Link from "next/link";
import type { Product } from "@/types/product";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

/** การ์ดแคตตาล็อก: รูป (หรือ placeholder), ชื่อ, แบรนด์, แท็ก, ราคาโปรสรุป */
export function CatalogCard({ product }: { product: Product }) {
  const hasActivePromo = (product.activePromotions?.length ?? 0) > 0;
  const firstPromo = product.activePromotions?.[0];
  const minNet =
    product.prices.length > 0
      ? Math.min(...product.prices.map((p) => p.netPrice))
      : null;

  return (
    <Link
      href={`/${product.id}`}
      className={`block rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
        hasActivePromo
          ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
      data-testid={`catalog-link-${product.id}`}
    >
      {hasActivePromo && (
        <div className="bg-[var(--color-primary)] px-4 py-1.5 text-center">
          <span className="text-xs font-semibold text-[var(--color-primary-foreground)]">
            โปรโมชั่น
            {firstPromo ? ` — ${firstPromo.name}` : ""}
          </span>
        </div>
      )}
      {/* รูปหรือ placeholder — aspect ratio คงที่เพื่อไม่ให้ layout กระโดด */}
      <div className="relative aspect-[4/3] w-full bg-[var(--color-surface-secondary)]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]"
            aria-hidden
          >
            <span className="text-xs">ไม่มีรูป</span>
          </div>
        )}
      </div>
      <div className="p-4 pb-2">
        <h2 className="font-semibold text-[var(--color-text)] line-clamp-2">
          {product.name}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          {product.brand}
        </p>
        {(product.freeGifts.length > 0 ||
          product.promotionEndDate ||
          hasActivePromo) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.freeGifts.length > 0 && (
              <span className="rounded-full bg-[var(--color-success)]/12 px-2 py-0.5 text-xs text-[var(--color-success)]">
                มีของแถม
              </span>
            )}
            {(product.promotionEndDate || hasActivePromo) && (
              <span className="rounded-full bg-[var(--color-primary)]/12 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                {hasActivePromo && product.activePromotions!.length > 1
                  ? `มี ${product.activePromotions!.length} โปร`
                  : "มีโปร"}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        {minNet != null ? (
          <p className="text-[var(--color-price)] font-bold">
            ราคาโปรจาก {formatPrice(minNet)} บาท
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">—</p>
        )}
      </div>
    </Link>
  );
}
