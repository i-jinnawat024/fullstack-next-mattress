"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
  syncPromotionProducts,
} from "@/lib/data/promotions";
import { promotionInsertSchema } from "@/lib/validation/promotion";
import type { Database } from "@/lib/db/schema";
import { CATALOG_TAG } from "@/lib/cache/catalog";

/** ล้าง cache หลังแก้ไขโปร — ให้ทุกหน้าที่เกี่ยวข้อง fetch ข้อมูลใหม่ */
function revalidateCatalog() {
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/promotion");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export type PromotionFormState = {
  error?: string;
  success?: boolean;
  id?: string;
};

function parseFormData(formData: FormData) {
  const isActive = formData.get("is_active") === "on" || formData.get("is_active") === "true";
  const discountType = formData.get("discount_type") as string;
  const productIds = formData.getAll("product_ids").filter((v): v is string => typeof v === "string" && v.trim() !== "");
  const minOrderRaw = formData.get("min_order_amount");
  const min_order_amount =
    minOrderRaw === "" || minOrderRaw === null || minOrderRaw === undefined
      ? null
      : Number(minOrderRaw);
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    is_active: isActive,
    started_date: String(formData.get("started_date") ?? "").trim(),
    end_date: String(formData.get("end_date") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    discount_type: discountType === "fixed" ? "fixed" as const : "percent" as const,
    discount_value: Number(formData.get("discount_value")) || 0,
    min_order_amount: typeof min_order_amount === "number" && !Number.isNaN(min_order_amount) && min_order_amount >= 0 ? min_order_amount : null,
    product_ids: productIds,
  };
  return raw;
}

export async function createPromotionAction(
  _prev: PromotionFormState,
  formData: FormData
): Promise<PromotionFormState> {
  const raw = parseFormData(formData);
  const parsed = promotionInsertSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const formErr = flat.formErrors?.[0];
    const fieldErr = flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0];
    const msg = typeof formErr === "string" ? formErr : typeof fieldErr === "string" ? fieldErr : parsed.error.message || "ข้อมูลไม่ถูกต้อง";
    return { error: msg };
  }
  try {
    const insert: Database["public"]["Tables"]["promotions"]["Insert"] = {
      name: parsed.data.name,
      is_active: parsed.data.is_active,
      started_date: parsed.data.started_date,
      end_date: parsed.data.end_date,
      description: parsed.data.description ?? null,
      discount_type: parsed.data.discount_type,
      discount_value: parsed.data.discount_value,
      min_order_amount: parsed.data.min_order_amount ?? null,
    };
    const id = await createPromotion(insert);
    await syncPromotionProducts(id, raw.product_ids);
    revalidateCatalog();
    return { success: true, id };
  } catch (e) {
    const msg = getErrorMessage(e);
    return { error: msg };
  }
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return "เกิดข้อผิดพลาด";
}

export async function updatePromotionAction(
  id: string,
  _prev: PromotionFormState,
  formData: FormData
): Promise<PromotionFormState> {
  const raw = parseFormData(formData);
  const parsed = promotionInsertSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const formErr = flat.formErrors?.[0];
    const fieldErr = flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0];
    const msg = typeof formErr === "string" ? formErr : typeof fieldErr === "string" ? fieldErr : parsed.error.message || "ข้อมูลไม่ถูกต้อง";
    return { error: msg };
  }
  try {
    await updatePromotion(id, {
      name: parsed.data.name,
      is_active: parsed.data.is_active,
      started_date: parsed.data.started_date,
      end_date: parsed.data.end_date,
      description: parsed.data.description ?? null,
      discount_type: parsed.data.discount_type,
      discount_value: parsed.data.discount_value,
      min_order_amount: parsed.data.min_order_amount ?? null,
    });
    await syncPromotionProducts(id, raw.product_ids);
    revalidateCatalog();
    return { success: true };
  } catch (e) {
    return { error: getErrorMessage(e) };
  }
}

/** ใช้กับ Client Form (รับ id จาก formData) */
export async function updatePromotionFormAction(
  prev: PromotionFormState,
  formData: FormData
): Promise<PromotionFormState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id.trim()) return { error: "ไม่พบ id" };
  return updatePromotionAction(id.trim(), prev, formData);
}

export async function deletePromotionAction(id: string): Promise<{ error?: string }> {
  try {
    await deletePromotion(id);
    revalidateCatalog();
    return {};
  } catch (e) {
    return { error: getErrorMessage(e) };
  }
}
