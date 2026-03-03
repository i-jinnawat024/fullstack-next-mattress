import type { PriceBySize } from "@/types/product";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

export function PriceDisplay({ prices }: { prices: PriceBySize[] }) {
  if (!prices.length) return null;
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4 md:p-5">
      <h2 className="text-[var(--text-heading)] md:text-xl font-semibold text-[var(--color-text)] mb-3">
        ราคาสุทธิ (Net Price)
      </h2>
      <ul className="space-y-2 md:space-y-3" aria-label="ราคาตามขนาด">
        {prices.map((p) => (
          <li
            key={p.size}
            className="flex items-center justify-between gap-4 py-2 md:py-3 border-b border-[var(--color-border)] last:border-0"
          >
            <span className="text-[var(--text-body)] md:text-lg text-[var(--color-text-muted)]">
              ขนาด {p.size} ฟุต
            </span>
            <div className="text-right">
              <span className="text-[var(--text-label)] md:text-base text-[var(--color-text-muted)] line-through mr-2">
                {formatPrice(p.msrp)}
              </span>
              <span className="text-price md:text-2xl">{formatPrice(p.netPrice)} บาท</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
