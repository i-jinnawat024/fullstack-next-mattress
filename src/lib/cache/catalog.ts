/**
 * Catalog data — โหลดจาก DB โดยตรง (ไม่ใช้ cache) เพื่อให้ข้อมูลอัปเดต realtime
 */

import {
  getAllProducts,
  getProductByIdWithActivePromotions,
  getProductsForCatalog,
  searchProducts,
} from "@/lib/data/products";
import type { Product } from "@/types/product";

export const CATALOG_TAG = "catalog";

export function getCachedAllProducts(): Promise<Product[]> {
  return getAllProducts();
}

export function getCachedCatalogProducts(): Promise<Product[]> {
  return getProductsForCatalog();
}

export function getCachedProductById(id: string): Promise<Product | null> {
  return getProductByIdWithActivePromotions(id);
}

export function getCachedSearchProducts(query: string, limit = 20): Promise<Product[]> {
  return searchProducts(query, limit);
}
