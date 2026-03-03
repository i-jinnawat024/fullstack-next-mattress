/**
 * Cache for catalog — wrap Supabase reads so results load within 3s
 */

import { unstable_cache } from "next/cache";
import {
  getAllProducts,
  getProductById,
  getProductsForCatalog,
  getProductByIdWithActivePromotions,
  searchProducts,
} from "@/lib/data/products";
import type { Product } from "@/types/product";

const REVALIDATE_SECONDS = 5 * 60; // 5 minutes
export const CATALOG_TAG = "catalog";

export function getCachedAllProducts(): Promise<Product[]> {
  return unstable_cache(getAllProducts, ["catalog", "all"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [CATALOG_TAG],
  })();
}

/** Catalog list with active promotions, sorted (มีโปรบนสุด). Invalidate when promotions or promotion_products change. */
export function getCachedCatalogProducts(): Promise<Product[]> {
  return unstable_cache(getProductsForCatalog, ["catalog", "list-with-promos"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [CATALOG_TAG],
  })();
}

export function getCachedProductById(id: string): Promise<Product | null> {
  return unstable_cache(
    () => getProductByIdWithActivePromotions(id),
    ["catalog", "product", id],
    { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] }
  )();
}

export function getCachedSearchProducts(query: string, limit = 20): Promise<Product[]> {
  return unstable_cache(
    () => searchProducts(query, limit),
    ["catalog", "search", query, String(limit)],
    { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] }
  )();
}
