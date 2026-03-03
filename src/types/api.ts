/**
 * API request/response shapes
 */

import type { Product } from "./product";

export interface ProductsSearchResponse {
  products: Product[];
  total?: number;
}

export interface ProductDetailResponse {
  product: Product | null;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}
