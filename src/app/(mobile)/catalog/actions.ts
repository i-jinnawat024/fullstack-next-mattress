"use server";

import { revalidatePath } from "next/cache";
import { syncProductPromotions, getProductPromotionIds } from "@/lib/data/promotions";
import { CATALOG_TAG } from "@/lib/cache/catalog";
import { revalidateTag } from "next/cache";

function revalidateCatalog() {
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export type CatalogDiscountState = { error?: string; success?: boolean };

export async function addProductPromotionAction(
  productId: string,
  promotionId: string
): Promise<CatalogDiscountState> {
  try {
    const current = await getProductPromotionIds(productId);
    if (current.includes(promotionId)) return { success: true };
    await syncProductPromotions(productId, [...current, promotionId]);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    return { error: msg };
  }
}

export async function removeProductPromotionAction(
  productId: string,
  promotionId: string
): Promise<CatalogDiscountState> {
  try {
    const current = await getProductPromotionIds(productId);
    const next = current.filter((id) => id !== promotionId);
    await syncProductPromotions(productId, next);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    return { error: msg };
  }
}

export async function reorderProductPromotionsAction(
  productId: string,
  orderedPromotionIds: string[]
): Promise<CatalogDiscountState> {
  try {
    await syncProductPromotions(productId, orderedPromotionIds);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    return { error: msg };
  }
}
