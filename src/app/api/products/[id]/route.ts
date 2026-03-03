/**
 * GET /api/products/[id] — product detail from Supabase
 */

import { NextRequest } from "next/server";
import { getCachedProductById } from "@/lib/cache/catalog";
import type { ProductDetailResponse, ApiErrorResponse } from "@/types/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getCachedProductById(id);
    const body: ProductDetailResponse = { product };
    return Response.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const body: ApiErrorResponse = { error: message, code: "PRODUCT_ERROR" };
    return Response.json(body, { status: 500 });
  }
}
