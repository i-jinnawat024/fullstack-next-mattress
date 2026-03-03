import { getCachedCatalogProducts } from "@/lib/cache/catalog";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";

export default async function HomePage() {
  const products = await getCachedCatalogProducts();

  return (
    <div
      className="container-app mx-auto py-6 md:py-10"
      data-testid="home-page"
    >
      {products.length === 0 ? (
        <div
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-text-muted)]"
          data-testid="home-empty"
        >
          ยังไม่มีสินค้า
        </div>
      ) : (
        <CatalogPageClient products={products} />
      )}
    </div>
  );
}
