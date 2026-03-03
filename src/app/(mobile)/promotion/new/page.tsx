import Link from "next/link";
import { createPromotionAction } from "@/app/(mobile)/promotion/actions";
import { PromotionForm } from "@/components/promotion/PromotionForm";
import { listProductsForAdmin } from "@/lib/data/products";

export default async function NewPromotionPage() {
  const productRows = await listProductsForAdmin({ includeDeleted: false });
  const products = productRows.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div
      className="container-app mx-auto py-6 md:py-10"
      data-testid="promotion-new-page"
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
            สร้างโปรโมชั่น
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            ตั้งชื่อ โปรโมชั่น กำหนดช่วงเวลา ประเภทส่วนลด และสินค้าที่เข้าร่วม
          </p>
        </header>
        <PromotionForm action={createPromotionAction} products={products} />
      </div>
    </div>
  );
}
