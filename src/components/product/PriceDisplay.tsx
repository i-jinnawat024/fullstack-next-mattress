import type { PriceBySize } from "@/types/product";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

type PriceDisplayProps = {
  prices: PriceBySize[];
  /** true = แสดงแค่ราคาจริง (ไม่แสดงราคาป้ายขีดฆ่า) */
  realPriceOnly?: boolean;
};

export function PriceDisplay({ prices, realPriceOnly = false }: PriceDisplayProps) {
  if (!prices.length) return null;
  return (
    <section className="rounded-xl border-2 border-[var(--color-primary)]/25 bg-[var(--color-surface-secondary)] p-4 md:p-5">
      <h2 className="mb-3 text-center font-semibold text-[var(--color-primary)] md:text-xl text-[var(--text-heading)]">
        {realPriceOnly ? "ราคาจริง" : "ราคาสุทธิ (Net Price)"}
      </h2>
      <ul className="space-y-2 md:space-y-3" aria-label="ราคาตามขนาด">
        {prices.map((p) => {
          const hasDiscount = !realPriceOnly && p.netPrice < p.msrp;
          const savings = hasDiscount ? p.msrp - p.netPrice : 0;
          return (
            <li
              key={p.size}
              className="flex flex-col gap-1 border-b border-[var(--color-border)] py-2 last:border-0 md:py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="text-[var(--text-body)] text-[var(--color-text-muted)] md:text-lg">
                ขนาด {p.size} ฟุต
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 sm:justify-end">
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-[var(--text-label)] text-[var(--color-text-muted)] line-through md:text-base">
                      {formatPrice(p.msrp)}
                    </span>
                  )}
                  <span className="text-price md:text-2xl font-semibold text-[var(--color-primary)]">
                    {formatPrice(
                      realPriceOnly ? p.msrp : hasDiscount ? p.netPrice : p.msrp
                    )}{" "}
                    บาท
                  </span>
                </div>
                {hasDiscount && savings > 0 && (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-success) 18%, transparent)",
                      color: "var(--color-success)",
                    }}
                    aria-label={`ประหยัด ${formatPrice(savings)} บาท`}
                  >
                    ประหยัด {formatPrice(savings)} บาท
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
