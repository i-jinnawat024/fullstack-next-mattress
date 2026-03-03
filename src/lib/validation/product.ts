/**
 * Zod schemas for Product / catalog — aligned with Supabase `products` table
 */

import { z } from "zod";

export const productInsertSchema = z.object({
  name: z.string().min(1, "ชื่อรุ่นต้องไม่ว่าง"),
  brand: z.string().min(1, "แบรนด์ต้องไม่ว่าง"),
  image_url: z.string().url().nullable().optional(),
  size_3_5_msrp: z.number().nonnegative().nullable().optional(),
  size_5_msrp: z.number().nonnegative().nullable().optional(),
  size_6_msrp: z.number().nonnegative().nullable().optional(),
  is_active: z.boolean().optional(),
});

/** Bulk upload row (one row per size variant) */
export const productRowSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  size: z.enum(["3.5", "5", "6"]),
  msrp: z.number().positive(),
});

export type ProductInsertInput = z.infer<typeof productInsertSchema>;
export type ProductRowInput = z.infer<typeof productRowSchema>;
