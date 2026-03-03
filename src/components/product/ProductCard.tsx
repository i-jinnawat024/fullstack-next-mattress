import Link from "next/link";
import type { Product } from "@/types/product";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

export function ProductCard({
  product,
  compact = false,
  href,
}: {
  product: Product;
  compact?: boolean;
  href?: string;
}) {
  const minNet = product.prices.length
    ? Math.min(...product.prices.map((p) => p.netPrice))
    : 0;
  const content = (
    <>
      <div className="font-semibold text-[var(--color-text)]">{product.name}</div>
      <div className="text-[var(--text-label)] text-[var(--color-text-muted)]">{product.brand}</div>
      {!compact && (
        <div className="text-price mt-1">
          ราคาสุทธิเริ่มต้น {formatPrice(minNet)} บาท
        </div>
      )}
      {compact && (
        <div className="text-[var(--text-body)] font-medium text-[var(--color-primary)] mt-0.5">
          ตั้งแต่ {formatPrice(minNet)} บาท
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors hover:bg-[var(--color-surface-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      >
        {content}
      </Link>
    );
  }
  return <div className="p-0">{content}</div>;
}
