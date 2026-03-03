import type { Product, ProductActivePromotion } from "@/types/product";

function formatDiscount(p: ProductActivePromotion): string {
  if (p.discountType === "percent") {
    return `ลด ${p.discountValue}%`;
  }
  return `ลด ${new Intl.NumberFormat("th-TH").format(p.discountValue)} บาท`;
}

/**
 * แสดงรายการโปรโมชั่นที่ผูกกับสินค้า (ใช้ในหน้าแคตตาล็อก)
 * หน้า product ไม่ส่ง activePromotions จึงไม่แสดง
 */
export function PromotionBlock({ product }: { product: Product }) {
  const list = product.activePromotions ?? [];
  if (list.length === 0) return null;

  return (
    <section
      className="rounded-xl border-2 border-[var(--color-primary)]/25 bg-[var(--color-surface-secondary)] p-4 md:p-5"
      aria-label="โปรโมชั่นที่ผูกกับสินค้า"
      data-testid="catalog-detail-promotions"
    >
      <h2 className="mb-3 font-semibold text-[var(--color-primary)] md:text-xl">
        ผูกกับโปรโมชั่น
      </h2>
      <ul className="space-y-2 md:space-y-3">
        {list.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--color-border)] py-2 last:border-0 md:py-3"
          >
            <span className="text-[var(--color-text)] font-medium">{p.name}</span>
            <span className="text-[var(--color-primary)] font-semibold">
              {formatDiscount(p)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
