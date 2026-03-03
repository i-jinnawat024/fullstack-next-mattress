"use client";

import Link from "next/link";
import type { Product, ProductActivePromotion } from "@/types/product";

function formatPrice(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("th-TH").format(n);
}

function minValid(values: number[]): number | null {
  const valid = values.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

function promoLabel(p: ProductActivePromotion): string {
  if (p.discountType === "percent") return `ลด ${p.discountValue}%`;
  return `ลด ${formatPrice(p.discountValue)} บาท`;
}

/** สีแท็กตามระดับส่วนลด: สูงมาก / สูง / กลาง / ต่ำ */
const TAG_COLORS_BY_LEVEL = [
  "bg-[var(--color-text-muted)]/15 text-[var(--color-text-muted)]", // ต่ำ
  "bg-[var(--color-primary)]/15 text-[var(--color-primary)]", // กลาง
  "bg-[var(--color-success)]/15 text-[var(--color-success)]", // สูง
  "bg-[var(--color-primary)]/25 text-[var(--color-primary)] font-semibold", // สูงมาก
] as const;

/** คืนระดับส่วนลด 0–3 ตามเปอร์เซ็นต์หรือจำนวนบาท */
function discountLevel(p: ProductActivePromotion): number {
  if (p.discountType === "percent") {
    if (p.discountValue >= 50) return 3;
    if (p.discountValue >= 25) return 2;
    if (p.discountValue >= 10) return 1;
    return 0;
  }
  // fixed (บาท)
  if (p.discountValue >= 5000) return 3;
  if (p.discountValue >= 1500) return 2;
  if (p.discountValue >= 500) return 1;
  return 0;
}

function tagColor(promo: ProductActivePromotion): string {
  const level = discountLevel(promo);
  return TAG_COLORS_BY_LEVEL[level];
}

/** เรียงโปรตามขนาดส่วนลด (มากไปน้อย) */
function sortPromosByDiscount(promos: ProductActivePromotion[]): ProductActivePromotion[] {
  return [...promos].sort((a, b) => b.discountValue - a.discountValue);
}

/** การ์ดแคตตาล็อก: รูป (หรือ placeholder), ชื่อ, แบรนด์, ราคาสุทธิ */
export function CatalogCard({
  product,
  basePath = "",
}: {
  product: Product;
  /** เช่น "/catalog" ให้ลิงก์ไป /catalog/[id] */
  basePath?: string;
}) {
  // ราคาที่ถูกที่สุดจากทุกขนาด (3.5, 5, 6): มีส่วนลดใช้ netPrice ต่ำสุด ไม่มีใช้ msrp ต่ำสุด
  const netPrices = product.prices.map((p) => p.netPrice);
  const msrpPrices = product.prices.map((p) => p.msrp);
  const minNet = minValid(netPrices);
  const minMsrp = minValid(msrpPrices);
  const displayPrice = minNet ?? minMsrp; // ใช้ราคาหลังหักส่วนลดถ้ามี ไม่ก็ราคาป้ายต่ำสุด
  const hasPrices = displayPrice != null;
  const hasDiscount = minNet != null && minMsrp != null && minNet < minMsrp;
  const hasLinkedPromo = (product.activePromotions?.length ?? 0) > 0;
  const href = basePath ? `${basePath}/${product.id}` : `/${product.id}`;

  return (
    <Link
      href={href}
      className={`block overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-sm transition-shadow hover:shadow-md focus:outline-none ${
        hasLinkedPromo ? "ring-2 ring-[var(--color-primary)]" : ""
      }`}
      data-testid={`catalog-link-${product.id}`}
    >
      <div
        className="flex min-h-[3rem] items-center justify-center bg-[var(--color-primary)] px-4 py-3 text-center"
        aria-hidden
      />
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
        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
          {product.brand}
        </p>
        {hasLinkedPromo && (product.activePromotions?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sortPromosByDiscount(product.activePromotions!).map((promo) => (
              <span
                key={promo.id}
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tagColor(promo)}`}
                data-testid={`catalog-promo-tag-${product.id}-${promo.id}`}
              >
                {promoLabel(promo)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        {hasPrices ? (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              ราคาที่ถูกที่สุด
            </p>
            <p className="flex flex-wrap items-baseline gap-2">
              {hasDiscount && minMsrp != null && (
                <span className="text-sm text-[var(--color-text-muted)] line-through">
                  {formatPrice(minMsrp)} บาท
                </span>
              )}
              <span className="text-[var(--color-price)] font-bold">
                {formatPrice(displayPrice)} บาท
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">—</p>
        )}
      </div>
    </Link>
  );
}
