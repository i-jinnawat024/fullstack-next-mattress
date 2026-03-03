/**
 * GET /api/products?q=... — search (autocomplete) products from Supabase
 */

import { NextRequest } from "next/server";
import { getCachedSearchProducts, getCachedAllProducts } from "@/lib/cache/catalog";
import type { ProductsSearchResponse, ApiErrorResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 50);
    const products = q.trim()
      ? await getCachedSearchProducts(q, limit)
      : await getCachedAllProducts();
    const body: ProductsSearchResponse = { products, total: products.length };
    return Response.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const body: ApiErrorResponse = { error: message, code: "SEARCH_ERROR" };
    return Response.json(body, { status: 500 });
  }
}
