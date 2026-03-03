import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { getCachedProductById } from "@/lib/cache/catalog";
import { CatalogPriceCard } from "@/components/catalog/CatalogPriceCard";
import { PromotionBlock } from "@/components/product/PromotionBlock";

export default async function CatalogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCachedProductById(id);
  if (!product) notFound();

  return (
    <div
      className="container-app mx-auto py-6 md:py-10 max-w-2xl"
      data-testid="catalog-detail-page"
    >
      <div className="mb-4">
        <Link
          href="/catalog"
          className="text-[var(--color-primary)] text-[var(--text-body)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded min-h-[var(--touch-min)] inline-flex items-center"
          data-testid="catalog-detail-back"
        >
          ← กลับไปแคตตาล็อก
        </Link>
      </div>

      <article
        className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-lg"
        data-testid={`catalog-detail-${product.id}`}
      >
        <div
          className="relative aspect-[4/3] w-full bg-[var(--color-surface-secondary)] overflow-hidden"
          data-testid="catalog-detail-image"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`รูปสินค้า ${product.name}`}
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
            Mattress City — ราคาโปรโมชั่น
          </p>
          <h1 className="mt-1 text-xl md:text-2xl font-bold text-[var(--color-primary-foreground)]">
            {product.name}
          </h1>
          <p className="text-sm text-[var(--color-primary-foreground)]/90">
            {product.brand}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <section aria-label="ราคาและส่วนลด">
            <CatalogPriceCard prices={product.prices} />
          </section>
          <PromotionBlock product={product} />
        </div>

        <div className="px-6 pb-6">
          <p className="text-center text-[var(--text-label)] text-[var(--color-text-muted)]">
            ราคานี้คำนวณจากส่วนลดโปรโมชั่นปัจจุบัน
          </p>
        </div>
      </article>
    </div>
  );
}
