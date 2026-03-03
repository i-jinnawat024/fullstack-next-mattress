import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
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
          <BackLink
            href="/products"
            variant="pill"
            data-testid="products-back-link"
          >
            <span aria-hidden>←</span>
            กลับไปรายการสินค้า
          </BackLink>
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
            is_active: row.is_active ?? true,
          }}
        />
      </div>
    </div>
  );
}
