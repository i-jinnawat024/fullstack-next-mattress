import type { Promotion } from "@/types/promotion";

/** กล่องซ้ายแสดงส่วนลดเป็นจุดเด่น (ใช้กับ CardListItem แทนรูปสินค้า) */
export function DiscountBadge({ p }: { p: Promotion }) {
  const isPercent = p.discountType === "percent";
  const valueText = isPercent
    ? `${p.discountValue}%`
    : `${Number(p.discountValue).toLocaleString("th-TH")}฿`;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-[var(--color-primary)]/10"
      aria-hidden
    >
      <span className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
        {valueText}
      </span>
      <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {isPercent ? "ส่วนลด" : "ลดบาท"}
      </span>
    </div>
  );
}
