import { getCachedCatalogProducts } from "@/lib/cache/catalog";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";

export default async function CatalogPage() {
  const products = await getCachedCatalogProducts();

  return (
    <div
      className="container-app mx-auto py-6 md:py-10"
      data-testid="catalog-page"
    >
      <header className="mb-6">
        <h1
          className="text-[var(--text-heading)] md:text-2xl font-bold text-[var(--color-text)]"
          data-testid="catalog-heading"
        >
          แคตตาล็อกสินค้า
        </h1>
      </header>

      {products.length === 0 ? (
        <div
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-muted)]"
          data-testid="catalog-empty"
        >
          ยังไม่มีสินค้าในแคตตาล็อก
        </div>
      ) : (
        <CatalogPageClient products={products} basePath="/catalog" />
      )}
    </div>
  );
}
