"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PromotionFormState } from "@/app/(mobile)/promotion/actions";

type ProductOption = { id: string; name: string };

type PromotionFormProps = {
  action: (prev: PromotionFormState, formData: FormData) => Promise<PromotionFormState>;
  /** สำหรับหน้าแก้ไข: ส่ง id เพื่อใส่ใน formData (hidden) */
  id?: string;
  /** รายการสินค้าให้เลือกเข้าร่วมโปร (ไม่รวมที่ soft-delete แล้ว) */
  products?: ProductOption[];
  initial?: {
    name: string;
    isActive: boolean;
    startedDate: string;
    endDate: string;
    description: string | null;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderAmount?: number | null;
    productIds?: string[];
  };
};

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-primary)] focus:outline-none";
const labelClass =
  "mb-1.5 block text-[var(--text-label)] font-medium text-[var(--color-text-muted)]";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl py-3 font-medium md:max-w-xs"
      data-testid="promotion-form-submit"
    >
      {pending ? "กำลังบันทึก..." : "บันทึก"}
    </Button>
  );
}

export function PromotionForm({ action, id, products = [], initial }: PromotionFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {} as PromotionFormState);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initial?.productIds ?? [])
  );
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const toggleProduct = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  useEffect(() => {
    if (state?.success) {
      router.refresh();
      router.replace("/promotion");
    }
  }, [state?.success, router]);

  return (
    <form
      action={formAction}
      className="space-y-6"
      data-testid="promotion-form"
      noValidate
    >
      {id != null && <input type="hidden" name="id" value={id} />}

      {state?.error && (
        <div
          className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]"
          data-testid="promotion-form-error"
          role="alert"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]"
          data-testid="promotion-form-success"
          role="status"
        >
          {initial ? "บันทึกแล้ว" : "สร้างโปรโมชั่นแล้ว"}
        </div>
      )}

      {/* ข้อมูลโปรโมชั่น */}
      <section
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-5 md:p-6"
        aria-labelledby="promotion-form-section-info-heading"
        data-testid="promotion-form-section-info"
      >
        <h2
          id="promotion-form-section-info-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        >
          ข้อมูลโปรโมชั่น
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="promo-name" className={labelClass}>
              ชื่อโปรโมชั่น <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="promo-name"
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="เช่น ลด 20% ทุกขนาด"
              className={inputClass}
              data-testid="promotion-name"
              aria-required="true"
            />
          </div>
          <div className="flex min-h-[var(--touch-min)] items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
            <input
              id="promo-is-active"
              name="is_active"
              type="checkbox"
              defaultChecked={initial?.isActive ?? true}
              className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              data-testid="promotion-is-active"
              aria-describedby="promo-is-active-desc"
            />
            <label
              htmlFor="promo-is-active"
              id="promo-is-active-desc"
              className="cursor-pointer text-[var(--color-text)]"
            >
              เปิดใช้งาน
            </label>
          </div>

          <div>
            <label htmlFor="promo-description" className={labelClass}>
              รายละเอียด (optional)
            </label>
            <textarea
              id="promo-description"
              name="description"
              rows={3}
              defaultValue={initial?.description ?? ""}
              placeholder="กรอกรายละเอียดเพิ่มเติม เช่น เงื่อนไขการใช้งาน"
              className={`${inputClass} min-h-[80px] resize-y`}
              data-testid="promotion-description"
            />
          </div>
        </div>
      </section>

      {/* ช่วงเวลา */}
      <section
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-5 md:p-6"
        aria-labelledby="promotion-form-section-dates-heading"
        data-testid="promotion-form-section-dates"
      >
        <h2
          id="promotion-form-section-dates-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        >
          ช่วงเวลา
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="promo-started-date" className={labelClass}>
              วันเริ่ม <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="promo-started-date"
              name="started_date"
              type="date"
              required
              defaultValue={initial?.startedDate ?? ""}
              className={inputClass}
              data-testid="promotion-started-date"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="promo-end-date" className={labelClass}>
              วันสิ้นสุด <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="promo-end-date"
              name="end_date"
              type="date"
              required
              defaultValue={initial?.endDate ?? ""}
              className={inputClass}
              data-testid="promotion-end-date"
              aria-required="true"
            />
          </div>
        </div>
      </section>

      {/* ส่วนลด */}
      <section
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-5 md:p-6"
        aria-labelledby="promotion-form-section-discount-heading"
        data-testid="promotion-form-section-discount"
      >
        <h2
          id="promotion-form-section-discount-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        >
          ประเภทและค่าส่วนลด
        </h2>
        <div className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="sr-only">ประเภทการลด</legend>
            <span className={labelClass}>ประเภทการลด <span className="text-[var(--color-error)]">*</span></span>
            <div className="flex gap-4" role="radiogroup" aria-label="ประเภทการลด">
              <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-colors has-[:checked]:border-[var(--color-primary)]">
                <input
                  type="radio"
                  name="discount_type"
                  value="percent"
                  defaultChecked={initial?.discountType !== "fixed"}
                  className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                  data-testid="promotion-type-percent"
                  aria-label="ลดเป็นเปอร์เซ็นต์"
                />
                <span className="font-medium text-[var(--color-text)]">เปอร์เซ็นต์ (%)</span>
              </label>
              <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-colors has-[:checked]:border-[var(--color-primary)]">
                <input
                  type="radio"
                  name="discount_type"
                  value="fixed"
                  defaultChecked={initial?.discountType === "fixed"}
                  className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                  data-testid="promotion-type-fixed"
                  aria-label="ลดเป็นบาท"
                />
                <span className="font-medium text-[var(--color-text)]">บาท (fixed)</span>
              </label>
            </div>
          </fieldset>
          <div>
            <label htmlFor="promo-discount-value" className={labelClass}>
              ค่าลด <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="promo-discount-value"
              name="discount_value"
              type="number"
              min={0}
              step={0.01}
              required
              defaultValue={initial?.discountValue ?? 0}
              placeholder="เช่น 10 หรือ 500"
              className={`${inputClass} md:max-w-[180px]`}
              data-testid="promotion-discount-value"
              aria-required="true"
            />
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              กรอกตัวเลขเท่านั้น — เปอร์เซ็นต์ เช่น 10 หรือ 20, บาท เช่น 500
            </p>
          </div>
          <div>
            <label htmlFor="promo-min-order-amount" className={labelClass}>
              ราคาขั้นต่ำ (บาท) เพื่อใช้โปรนี้
            </label>
            <input
              id="promo-min-order-amount"
              name="min_order_amount"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.minOrderAmount ?? ""}
              placeholder="เว้นว่าง = ใช้ได้ทุกราคา"
              className={`${inputClass} md:max-w-[180px]`}
              data-testid="promotion-min-order-amount"
              aria-describedby="promo-min-order-desc"
            />
            <p id="promo-min-order-desc" className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              ถ้ากรอก ระบบจะใช้โปรนี้เฉพาะเมื่อราคาสินค้าไม่ต่ำกว่านี้ (บาท)
            </p>
          </div>
        </div>
      </section>

      {/* สินค้าที่เข้าร่วมโปร */}
      {products.length > 0 && (
        <section
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-5 md:p-6"
          aria-labelledby="promotion-form-section-products-heading"
          data-testid="promotion-form-section-products"
        >
          {Array.from(selectedIds).map((productId) => (
            <input
              key={productId}
              type="hidden"
              name="product_ids"
              value={productId}
            />
          ))}
          <h2
            id="promotion-form-section-products-heading"
            className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
          >
            สินค้าที่เข้าร่วมโปร
          </h2>

          {/* สรุปที่เลือกแล้ว — compact */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">
              เลือกแล้ว {selectedIds.size} สินค้า
            </p>
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedIds).map((productId) => {
                  const p = products.find((x) => x.id === productId);
                  return (
                    <span
                      key={productId}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm text-[var(--color-text)]"
                    >
                      <span className="max-w-[180px] truncate" title={p?.name}>
                        {p?.name ?? productId}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProduct(productId)}
                        className="flex shrink-0 rounded p-0.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                        aria-label={`เอา ${p?.name ?? productId} ออกจากโปรโมชั่น`}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* ค้นหาสินค้า */}
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
              data-testid="promotion-product-search"
              aria-label="ค้นหาสินค้าเพื่อเลือกเข้าร่วมโปร"
            />
          </div>

          {/* รายการเลือก (กรองตาม search) */}
          <ul
            className="max-h-52 space-y-0 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            aria-label="รายการสินค้าให้เลือก"
          >
            {filteredProducts.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                {productSearch.trim()
                  ? "ไม่พบสินค้าตามคำค้น — ลองเปลี่ยนคำหรือล้างช่องค้นหา"
                  : "ไม่มีสินค้า"}
              </li>
            ) : (
              filteredProducts.map((p) => (
                <li key={p.id}>
                  <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3 border-b border-[var(--color-border)] px-3 py-2 last:border-b-0 transition-colors hover:bg-[var(--color-surface-secondary)]">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                      data-testid={`promotion-product-${p.id}`}
                      aria-label={`เลือก ${p.name}`}
                    />
                    <span className="truncate text-sm text-[var(--color-text)]">
                      {p.name}
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </section>
      )}

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
