/**
 * Zod schemas for Promotion CRUD — aligned with Supabase promotions table
 */

import { z } from "zod";

export const promotionInsertSchema = z
  .object({
    name: z.string().min(1, "ชื่อโปรต้องไม่ว่าง"),
    is_active: z.boolean(),
    started_date: z.string().min(1, "วันเริ่มต้องไม่ว่าง"),
    end_date: z.string().min(1, "วันสิ้นสุดต้องไม่ว่าง"),
    description: z.string().nullable().optional(),
    discount_type: z.enum(["percent", "fixed"]),
    discount_value: z.number().min(0, "ค่าลดต้องไม่ติดลบ"),
  })
  .refine(
    (data) => {
      if (!data.started_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.started_date);
    },
    { message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม", path: ["end_date"] }
  )
  .refine(
    (data) => {
      if (data.discount_type !== "percent") return true;
      return data.discount_value <= 100;
    },
    { message: "ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100", path: ["discount_value"] }
  );

export type PromotionInsertInput = z.infer<typeof promotionInsertSchema>;
