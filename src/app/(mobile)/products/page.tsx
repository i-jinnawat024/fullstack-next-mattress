import Link from "next/link";
import { listProductsForAdmin, getDistinctBrands } from "@/lib/data/products";
import { ProductsPageClient } from "@/components/products/ProductsPageClient";
import { ProductUploadButton } from "@/components/products/ProductUploadButton";

export default async function ProductsPage() {
  const [rows, brands] = await Promise.all([
    listProductsForAdmin({ includeDeleted: false }),
    getDistinctBrands(),
  ]);

  return (
    <div
      className="container-app mx-auto w-full max-w-full py-6 md:py-10"
      data-testid="products-page"
    >
      <div className="w-full min-w-0">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1
            className="text-[var(--text-heading)] font-bold tracking-tight text-[var(--color-text)] md:text-2xl"
            data-testid="products-heading"
          >
            จัดการสินค้า
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <ProductUploadButton />
            <Link
              href="/products/new"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 focus:outline-none"
              data-testid="products-add-link"
            >
              เพิ่มสินค้า
            </Link>
          </div>
        </header>

        <ProductsPageClient rows={rows} brands={brands} />
      </div>
    </div>
  );
}
