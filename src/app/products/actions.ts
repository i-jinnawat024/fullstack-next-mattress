"use server";

import { redirect } from "next/navigation";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
} from "@/lib/data/products";
import { CATALOG_TAG } from "@/lib/cache/catalog";
import { productInsertSchema } from "@/lib/validation/product";

/** ล้าง cache หลังแก้ไขสินค้า — ให้ทุกหน้าที่เกี่ยวข้อง fetch ข้อมูลใหม่ */
function revalidateProductAndCatalog() {
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/products");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export type ProductFormState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const num = (v: FormDataEntryValue | null) => {
    if (v == null || String(v).trim() === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    image_url: imageUrl,
    size_3_5_msrp: num(formData.get("size_3_5_msrp")),
    size_5_msrp: num(formData.get("size_5_msrp")),
    size_6_msrp: num(formData.get("size_6_msrp")),
    is_active: formData.get("is_active") === "true",
  };
  const parsed = productInsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "ข้อมูลไม่ถูกต้อง" };
  }
  try {
    await createProduct(parsed.data as Parameters<typeof createProduct>[0]);
    revalidateProductAndCatalog();
    redirect("/products");
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err?.code === "23505") {
      return { error: "ข้อมูลซ้ำไม่ได้ (ชื่อสินค้ามีในระบบแล้ว)" };
    }
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "เกิดข้อผิดพลาด";
    console.error("[createProductAction]", e);
    return { error: msg };
  }
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const num = (v: FormDataEntryValue | null) => {
    if (v == null || String(v).trim() === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    image_url: imageUrl,
    size_3_5_msrp: num(formData.get("size_3_5_msrp")),
    size_5_msrp: num(formData.get("size_5_msrp")),
    size_6_msrp: num(formData.get("size_6_msrp")),
    is_active: formData.get("is_active") === "true",
  };
  const parsed = productInsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "ข้อมูลไม่ถูกต้อง" };
  }
  try {
    await updateProduct(id, parsed.data as Parameters<typeof updateProduct>[1]);
    revalidateProductAndCatalog();
    return { success: true };
  } catch (e) {
    const err = e as { code?: string };
    if (err?.code === "23505") {
      return { error: "ข้อมูลซ้ำไม่ได้ (ชื่อสินค้ามีในระบบแล้ว)" };
    }
    return { error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

/** ใช้กับ Client Form (รับ id จาก formData) */
export async function updateProductFormAction(
  prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id.trim()) return { error: "ไม่พบ id" };
  return updateProductAction(id.trim(), prev, formData);
}

export async function softDeleteProductAction(id: string): Promise<{ error?: string }> {
  try {
    await softDeleteProduct(id);
    revalidateProductAndCatalog();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function restoreProductAction(id: string): Promise<{ error?: string }> {
  try {
    await restoreProduct(id);
    revalidateProductAndCatalog();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}
