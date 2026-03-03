import { createProductAction } from "@/app/products/actions";
import { getDistinctBrands } from "@/lib/data/products";
import { ProductForm } from "@/components/products/ProductForm";
import { BackLink } from "@/components/ui/BackLink";

export default async function NewProductPage() {
  const brands = await getDistinctBrands();
  return (
    <div
      className="container-app mx-auto max-w-none w-full py-6 md:py-10"
      data-testid="products-new-page"
    >
      <div className="content-prose mx-auto max-w-none w-full">
        <nav className="mb-6" aria-label="breadcrumb">
          <BackLink data-testid="products-back-link" />
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
