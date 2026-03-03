"use client";

import type { PriceBySize } from "@/types/product";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

/** การ์ดแสดง ราคาจริง / ส่วนลด / ราคาโปร — สำหรับให้เซลล์ยื่นลูกค้าดู */
export function CatalogPriceCard({
  prices,
  sizeLabel = "ขนาด",
  compact = false,
}: {
  prices: PriceBySize[];
  sizeLabel?: string;
  compact?: boolean;
}) {
  if (!prices.length) return null;

  return (
    <div
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
      data-testid="catalog-price-card"
    >
      <div className="bg-[var(--color-primary)] px-4 py-2">
        <h3 className="text-sm font-semibold text-[var(--color-primary-foreground)]">
          ราคาปกติ → ราคาโปรโมชั่น
        </h3>
      </div>
      <ul className="divide-y divide-[var(--color-border)]" aria-label="ราคาตามขนาด">
        {prices.map((p) => {
          const discountAmount = p.msrp - p.netPrice;
          return (
            <li
              key={p.size}
              className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${compact ? "px-4 py-2" : "px-4 py-3"}`}
              data-testid={`catalog-price-size-${p.size}`}
            >
              <span className="text-[var(--text-body)] text-[var(--color-text-muted)]">
                {sizeLabel} {p.size} ฟุต
              </span>
              <div className="text-right">
                <span className="text-[var(--text-label)] text-[var(--color-text-muted)] line-through mr-2">
                  {formatPrice(p.msrp)} บาท
                </span>
                <span
                  className="inline-block rounded-full bg-[var(--color-error)]/12 px-2 py-0.5 text-xs font-semibold text-[var(--color-error)]"
                  aria-label={`ส่วนลด ${p.discountPercent}%`}
                >
                  ลด {p.discountPercent}% (−{formatPrice(discountAmount)} บาท)
                </span>
                <span
                  className={`block mt-1 font-bold text-[var(--color-price)] ${compact ? "text-lg" : "text-price"}`}
                >
                  ราคาโปร {formatPrice(p.netPrice)} บาท
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
