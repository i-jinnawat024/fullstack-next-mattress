import { notFound } from "next/navigation";
import Link from "next/link";
import { getPromotionByIdWithProductIds } from "@/lib/data/promotions";
import { listProductsForAdmin } from "@/lib/data/products";
import { updatePromotionFormAction } from "@/app/(mobile)/promotion/actions";
import { PromotionForm } from "@/components/promotion/PromotionForm";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, productRows] = await Promise.all([
    getPromotionByIdWithProductIds(id),
    listProductsForAdmin({ includeDeleted: false }),
  ]);
  if (!promotion) notFound();
  const products = productRows.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div
      className="container-app mx-auto py-6 md:py-10"
      data-testid="promotion-edit-page"
    >
      <div className="content-prose mx-auto">
        <nav className="mb-6" aria-label="breadcrumb">
          <Link
            href="/promotion"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] no-underline transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-primary)]"
            data-testid="promotion-back-link"
          >
            <span aria-hidden>←</span>
            กลับไปรายการโปรโมชั่น
          </Link>
        </nav>
        <header className="mb-8">
          <h1
            className="text-[var(--text-heading)] font-bold tracking-tight text-[var(--color-text)] md:text-2xl"
            data-testid="promotion-heading"
          >
            แก้ไขโปรโมชั่น
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            แก้ไขข้อมูลโปรโมชั่น ช่วงเวลา ส่วนลด และสินค้าที่เข้าร่วม
          </p>
        </header>
        <PromotionForm
          action={updatePromotionFormAction}
          id={id}
          products={products}
          initial={{
            name: promotion.name,
            isActive: promotion.isActive,
            startedDate: promotion.startedDate,
            endDate: promotion.endDate,
            description: promotion.description,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            productIds: promotion.productIds ?? [],
          }}
        />
      </div>
    </div>
  );
}
