"use server";

import { revalidatePath } from "next/cache";
import {
  upsertMonthlyTarget,
  deleteMonthlyTarget,
} from "@/lib/data/sales";

export type SettingFormState = { error?: string; success?: boolean };

export async function upsertTargetAction(
  _prev: SettingFormState,
  formData: FormData
): Promise<SettingFormState> {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const target_amount = Number(String(formData.get("target_amount")).replace(/,/g, ""));

  if (!Number.isFinite(year) || year < 2000 || year > 2100)
    return { error: "ปีไม่ถูกต้อง" };
  if (!Number.isFinite(month) || month < 1 || month > 12)
    return { error: "เดือนไม่ถูกต้อง" };
  if (!Number.isFinite(target_amount) || target_amount < 0)
    return { error: "กรุณากรอกเป้าหมาย (บาท) ที่ถูกต้อง" };

  try {
    await upsertMonthlyTarget(year, month, target_amount);
    revalidatePath("/setting");
    revalidatePath("/stat");
    return { success: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    console.error("[upsertTargetAction]", e);
    return { error: msg };
  }
}

export async function deleteTargetAction(id: string): Promise<SettingFormState> {
  if (!id) return { error: "ไม่มีรายการที่เลือก" };
  try {
    await deleteMonthlyTarget(id);
    revalidatePath("/setting");
    revalidatePath("/stat");
    return { success: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    console.error("[deleteTargetAction]", e);
    return { error: msg };
  }
}
