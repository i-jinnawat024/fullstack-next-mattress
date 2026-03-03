import type { Product } from "@/types/product";

function formatDate(s: string | null) {
  if (!s) return null;
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(s));
  } catch {
    return s;
  }
}

function formatDiscount(p: { discountType: "percent" | "fixed"; discountValue: number }) {
  if (p.discountType === "percent") return `ลด ${p.discountValue}%`;
  return `ลด ${Number(p.discountValue).toLocaleString("th-TH")} บาท`;
}

export function PromotionBlock({ product }: { product: Product }) {
  const hasGifts = product.freeGifts.length > 0;
  const hasCredit = !!product.creditPromoText?.trim();
  const hasEndDate = !!product.promotionEndDate;
  const activePromos = product.activePromotions ?? [];

  if (!hasGifts && !hasCredit && !hasEndDate && activePromos.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-5">
      <h2 className="text-[var(--text-heading)] md:text-xl font-semibold text-[var(--color-text)] mb-3">
        รายละเอียดโปรโมชั่น
      </h2>
      {activePromos.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[var(--text-label)] font-medium text-[var(--color-text-muted)] mb-2">
            โปรจากแคมเปญ
          </h3>
          <ul className="space-y-2">
            {activePromos.map((promo) => (
              <li
                key={promo.id}
                className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-2"
              >
                <span className="font-medium text-[var(--color-text)]">{promo.name}</span>
                <span className="ml-2 text-sm text-[var(--color-primary)]">
                  {formatDiscount(promo)}
                </span>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  สิ้นสุด: {formatDate(promo.endDate)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasGifts && (
        <div className="mb-3">
          <h3 className="text-[var(--text-label)] font-medium text-[var(--color-text-muted)] mb-1">
            ของแถม
          </h3>
          <ul className="list-disc list-inside text-[var(--text-body)] text-[var(--color-text)]">
            {product.freeGifts.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}
      {hasCredit && (
        <div className="mb-3">
          <h3 className="text-[var(--text-label)] font-medium text-[var(--color-text-muted)] mb-1">
            โปรบัตรเครดิต
          </h3>
          <p className="text-[var(--text-body)] text-[var(--color-text)]">
            {product.creditPromoText}
          </p>
        </div>
      )}
      {hasEndDate && (
        <p className="text-[var(--text-label)] text-[var(--color-text-muted)]">
          สิ้นสุดโปรโมชั่น: {formatDate(product.promotionEndDate)}
        </p>
      )}
    </section>
  );
}
