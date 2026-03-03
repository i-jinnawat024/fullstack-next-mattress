/**
 * POST /api/products/upload — อัปโหลดสินค้าจาก xlsx/csv (ส่งเป็น JSON ที่ parse แล้วจาก client)
 */

import { NextRequest } from "next/server";
import { createProductsBulk, type ProductUploadRow } from "@/lib/data/products";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? (body.rows as ProductUploadRow[]) : [];
    if (rows.length === 0) {
      return Response.json(
        { error: "ไม่มีข้อมูล (ส่ง rows เป็น array)", created: 0, skipped: 0, errors: [] },
        { status: 400 }
      );
    }
    const result = await createProductsBulk(rows);
    return Response.json({
      created: result.created,
      skipped: result.skipped,
      errors: result.errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json(
      { error: message, created: 0, skipped: 0, errors: [] },
      { status: 500 }
    );
  }
}
