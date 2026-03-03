import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { getProductByIdWithActivePromotions } from "@/lib/data/products";
import { listPromotions } from "@/lib/data/promotions";
import { CatalogDetailContent } from "@/components/catalog/CatalogDetailContent";

export default async function CatalogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, availablePromotions] = await Promise.all([
    getProductByIdWithActivePromotions(id),
    listPromotions({ activeOnly: true }),
  ]);
  if (!product) notFound();

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

        <CatalogDetailContent product={product} availablePromotions={availablePromotions} />
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
