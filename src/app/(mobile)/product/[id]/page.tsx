import { notFound } from "next/navigation";
import Link from "next/link";
import { getCachedProductById } from "@/lib/cache/catalog";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { PromotionBlock } from "@/components/product/PromotionBlock";
import { Button } from "@/components/ui/Button";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCachedProductById(id);
  if (!product) notFound();

  const discountPercent = product.prices[0]?.discountPercent ?? 0;

  return (
    <div className="container-app mx-auto py-6 md:py-10">
      <div className="content-prose mx-auto lg:max-w-4xl">
        <div className="mb-4">
          <Link
            href="/"
            className="text-[var(--color-primary)] text-[var(--text-body)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded min-h-[var(--touch-min)] inline-flex items-center"
          >
            ← กลับไปค้นหา
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr,1fr] lg:gap-8">
          <div>
            <header className="mb-6">
              <h1 className="text-[var(--text-heading)] md:text-2xl font-bold text-[var(--color-text)]">
                {product.name}
              </h1>
              <p className="text-[var(--text-label)] text-[var(--color-text-muted)]">
                {product.brand}
              </p>
            </header>

            {/* 1) ราคาสุทธิแยกขนาด */}
            <div className="mb-4">
              <PriceDisplay prices={product.prices} />
            </div>

            {/* 2) ราคาป้าย + % ส่วนลด */}
            {product.prices.length > 0 && (
              <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h2 className="text-[var(--text-label)] font-medium text-[var(--color-text-muted)] mb-1">
                  ราคาป้าย (MSRP) / ส่วนลด
                </h2>
                <p className="text-[var(--text-body)] text-[var(--color-text)]">
                  ส่วนลด {discountPercent}% จากราคาป้าย
                </p>
              </div>
            )}
          </div>

          <div>
            {/* 3) ของแถม (4) โปรบัตร (5) วันหมดโปร */}
            <div className="mb-6">
              <PromotionBlock product={product} />
            </div>

            <Button variant="secondary" className="w-full md:max-w-xs" disabled aria-disabled>
              บันทึกการขาย (Phase 2)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
