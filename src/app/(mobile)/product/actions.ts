"use server";

import { revalidatePath } from "next/cache";
import { insertSalesRecord } from "@/lib/data/sales";

export type RecordSaleState = { error?: string; success?: boolean };

export async function recordSaleAction(
  _prev: RecordSaleState,
  formData: FormData
): Promise<RecordSaleState> {
  const product_id = String(formData.get("product_id") ?? "").trim();
  const sold_priceRaw = formData.get("sold_price");
  const sold_price = sold_priceRaw != null ? Number(String(sold_priceRaw).replace(/,/g, "")) : NaN;
  const customer_name = String(formData.get("customer_name") ?? "").trim() || null;
  const bill_no = String(formData.get("bill_no") ?? "").trim() || null;
  const sold_atRaw = String(formData.get("sold_at") ?? "").trim();
  const sold_at = sold_atRaw ? new Date(sold_atRaw).toISOString() : undefined;

  if (!product_id) return { error: "ไม่มีสินค้า" };
  if (!Number.isFinite(sold_price) || sold_price < 0)
    return { error: "กรุณากรอกราคาขายที่ถูกต้อง" };

  try {
    await insertSalesRecord({
      product_id,
      sold_price,
      customer_name,
      bill_no,
      sold_at,
    });
    revalidatePath("/stat");
    revalidatePath("/product/[id]", "page");
    return { success: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : typeof e === "object" && e !== null && "message" in e ? String((e as { message: unknown }).message) : "เกิดข้อผิดพลาด";
    console.error("[recordSaleAction]", e);
    return { error: msg };
  }
}
