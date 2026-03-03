/**
 * GET /api/catalog — รายการสินค้าแคตตาล็อก (พร้อมโปรโมชั่น) สำหรับ client refetch
 */

import { getCachedCatalogProducts } from "@/lib/cache/catalog";
import type { ProductsSearchResponse, ApiErrorResponse } from "@/types/api";

export async function GET() {
  try {
    const products = await getCachedCatalogProducts();
    const body: ProductsSearchResponse = { products, total: products.length };
    return Response.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const body: ApiErrorResponse = { error: message, code: "CATALOG_ERROR" };
    return Response.json(body, { status: 500 });
  }
}
