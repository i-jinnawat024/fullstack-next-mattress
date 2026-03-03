"use client";

import { useRef, useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { recordSaleAction, type RecordSaleState } from "@/app/(mobile)/product/actions";
import type { PriceBySize } from "@/types/product";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none";
const labelClass = "mb-1.5 block text-[var(--text-label)] font-medium text-[var(--color-text-muted)]";

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full rounded-xl py-3">
      {pending ? "กำลังบันทึก..." : "บันทึกการขาย"}
    </Button>
  );
}

type RecordSaleButtonProps = {
  productId: string;
  productName: string;
  prices: PriceBySize[];
};

export function RecordSaleButton({ productId, productName, prices }: RecordSaleButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(recordSaleAction, {} as RecordSaleState);
  const [suggestedPrice, setSuggestedPrice] = useState<number | "">("");
  const lastSuccessRef = useRef(false);
  const now = new Date();
  const soldAtDefault =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    "T" +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  const open = () => {
    lastSuccessRef.current = false;
    setSuggestedPrice(prices[0]?.netPrice ?? "");
    dialogRef.current?.showModal();
  };
  const close = () => {
    lastSuccessRef.current = false;
    dialogRef.current?.close();
  };

  useEffect(() => {
    if (state?.success && !lastSuccessRef.current) {
      toast.success("บันทึกการขายแล้ว");
      lastSuccessRef.current = true;
      dialogRef.current?.close();
    }
  }, [state?.success]);
  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state?.error]);

  return (
    <>
      <Button
        variant="primary"
        className="mx-auto block w-full max-w-xs"
        onClick={open}
        type="button"
        data-testid="record-sale-btn"
      >
        บันทึกการขาย
      </Button>
      <dialog
        ref={dialogRef}
        onCancel={close}
        className="fixed inset-0 z-50 w-[min(100vw,28rem)] max-h-[90vh] overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl backdrop:bg-black/30"
        aria-labelledby="record-sale-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="record-sale-title" className="text-lg font-bold text-[var(--color-text)]">
            บันทึกการขาย
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>
        <p className="text-[var(--color-text-muted)] mb-4">{productName}</p>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="product_id" value={productId} />
          <div>
            <label htmlFor="record-sale-price" className={labelClass}>
              ราคาขาย (บาท) *
            </label>
            <input
              id="record-sale-price"
              type="number"
              name="sold_price"
              min={0}
              step={1}
              value={suggestedPrice}
              onChange={(e) =>
                setSuggestedPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
              required
            />
            {prices.length > 0 && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                ราคาสุทธิตามขนาด:{" "}
                {prices.map((p) => (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSuggestedPrice(p.netPrice)}
                    className="mr-2 underline"
                  >
                    {p.size} ฟุต {formatPrice(p.netPrice)} บาท
                  </button>
                ))}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="record-sale-customer" className={labelClass}>
              ชื่อลูกค้า
            </label>
            <input
              id="record-sale-customer"
              type="text"
              name="customer_name"
              className={inputClass}
              placeholder="ไม่บังคับ"
            />
          </div>
          <div>
            <label htmlFor="record-sale-bill" className={labelClass}>
              เลขที่บิล
            </label>
            <input
              id="record-sale-bill"
              type="text"
              name="bill_no"
              className={inputClass}
              placeholder="ไม่บังคับ"
            />
          </div>
          <div>
            <label htmlFor="record-sale-at" className={labelClass}>
              วันเวลาที่ขาย
            </label>
            <input
              id="record-sale-at"
              type="datetime-local"
              name="sold_at"
              defaultValue={soldAtDefault}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <SubmitBtn />
            <Button type="button" variant="ghost" onClick={close}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
