import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductByIdForAdmin, getDistinctBrands } from "@/lib/data/products";
import { updateProductFormAction } from "@/app/products/actions";
import { ProductForm } from "@/components/products/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row, brands] = await Promise.all([
    getProductByIdForAdmin(id),
    getDistinctBrands(),
  ]);
  if (!row) notFound();

  return (
    <div
      className="container-app mx-auto py-6 md:py-10"
      data-testid="products-edit-page"
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
            data-testid="products-edit-heading"
          >
            แก้ไขสินค้า
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            แก้ไขข้อมูลสินค้า รูปภาพ และราคาตามขนาด
          </p>
        </header>
        <ProductForm
          action={updateProductFormAction}
          brands={brands}
          id={id}
          initial={{
            name: row.name,
            brand: row.brand,
            image_url: row.image_url ?? null,
            size_3_5_msrp: row.size_3_5_msrp,
            size_5_msrp: row.size_5_msrp,
            size_6_msrp: row.size_6_msrp,
          }}
        />
      </div>
    </div>
  );
}
