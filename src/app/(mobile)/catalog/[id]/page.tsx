import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageIcon, Link2 } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { getCachedProductById } from "@/lib/cache/catalog";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { PromotionBlock } from "@/components/product/PromotionBlock";

export default async function CatalogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCachedProductById(id);
  if (!product) notFound();

  const hasDiscountMatch =
    (product.activePromotions?.length ?? 0) > 0 ||
    product.prices.some((p) => p.discountPercent > 0);

  return (
    <div
      className="container-app mx-auto max-w-2xl py-6 md:py-10"
      data-testid="catalog-detail-page"
    >
      <div className="mb-4">
        <BackLink href="/catalog" data-testid="catalog-detail-back">
          <span aria-hidden>←</span>
          กลับไปแคตตาล็อก
        </BackLink>
      </div>

      <article
        className="overflow-hidden rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        data-testid={`catalog-detail-${product.id}`}
      >
        <div
          className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-surface-secondary)]"
          data-testid="catalog-detail-image"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
              <ImageIcon className="h-14 w-14 opacity-50" aria-hidden />
              <span className="text-sm">ไม่มีรูปสินค้า</span>
            </div>
          )}
        </div>

        <div className="bg-[var(--color-primary)] px-6 py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-primary-foreground)]/80">
            Mattress City — แคตตาล็อก
          </p>
          <h1 className="mt-1 text-xl font-bold text-[var(--color-primary-foreground)] md:text-2xl">
            {product.name}
          </h1>
          <p className="text-sm text-[var(--color-primary-foreground)]/90">
            {product.brand}
          </p>
        </div>

        <div className="space-y-6 p-6">
          <section aria-label="ราคาหลังหักส่วนลด">
            <PriceDisplay prices={product.prices} />
          </section>
          {hasDiscountMatch && (
            <p
              className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]"
              data-testid="catalog-detail-has-discount"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>สินค้านี้มีส่วนลดที่จับคู่กับโปรโมชั่นอยู่</span>
            </p>
          )}
          <PromotionBlock product={product} />
        </div>
      </article>

      <p className="mt-6 text-center">
        <Link
          href={`/product/${product.id}/quote`}
          className="inline-flex min-h-[var(--touch-min)] items-center text-[var(--color-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
        >
          สร้างใบเสนอราคา / พิมพ์
        </Link>
      </p>
    </div>
  );
}
