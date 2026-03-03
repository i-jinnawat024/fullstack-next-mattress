import Link from "next/link";
import { createProductAction } from "@/app/products/actions";
import { getDistinctBrands } from "@/lib/data/products";
import { ProductForm } from "@/components/products/ProductForm";

export default async function NewProductPage() {
  const brands = await getDistinctBrands();
  return (
    <div
      className="container-app mx-auto py-6 md:py-10"
      data-testid="products-new-page"
    >
      <div className="content-prose mx-auto">
        <nav className="mb-6" aria-label="breadcrumb">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] no-underline transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-primary)]"
            data-testid="products-back-link"
          >
            <span aria-hidden>←</span>
            กลับไปรายการสินค้า
          </Link>
        </nav>
        <header className="mb-8">
          <h1
            className="text-[var(--text-heading)] font-bold tracking-tight text-[var(--color-text)] md:text-2xl"
            data-testid="products-new-heading"
          >
            เพิ่มสินค้า
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            กรอกชื่อรุ่น แบรนด์ รูปภาพ และราคาตามขนาด
          </p>
        </header>
        <ProductForm action={createProductAction} brands={brands} />
      </div>
    </div>
  );
}
