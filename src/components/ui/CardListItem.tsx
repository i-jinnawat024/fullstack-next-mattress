"use client";

import type { ReactNode } from "react";

export type CardListItemProps = {
  /** ซ้าย: รูป / badge (จะถูกห่อด้วยกล่องขนาดคงที่) */
  left: ReactNode;
  /** กลาง: เนื้อหา */
  center: ReactNode;
  /** ขวา: ปุ่มจัดการ (แก้ไข, ลบ) */
  right: ReactNode;
  /** สำหรับใส่ใน <ul> ใช้ as="li" และ data-testid ที่ item */
  "data-testid"?: string;
  /** รองรับทั้งใน <ul> (li) และที่อื่น (div) */
  as?: "li" | "div";
};

const leftSlotClass =
  "h-28 w-full shrink-0 sm:h-auto sm:w-28 sm:min-h-[100px]";
const centerSlotClass =
  "flex min-w-0 flex-1 flex-col justify-center gap-1 p-4 sm:gap-0.5";
const rightSlotClass =
  "flex shrink-0 flex-row items-center justify-end gap-2 border-t border-[var(--color-border)] p-3 sm:flex-col sm:border-t-0 sm:border-l sm:justify-center";

/**
 * Card list item กลาง — โครงซ้าย | กลาง | ขวา ใช้ได้ทั้งรายการสินค้าและโปรโมชั่น
 */
export function CardListItem({
  left,
  center,
  right,
  "data-testid": dataTestId,
  as: Component = "li",
}: CardListItemProps) {
  const className =
    "flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] sm:flex-row sm:items-stretch";

  return (
    <Component
      className={className}
      {...(dataTestId != null ? { "data-testid": dataTestId } : {})}
    >
      <div className={leftSlotClass}>{left}</div>
      <div className={centerSlotClass}>{center}</div>
      <div className={rightSlotClass}>{right}</div>
    </Component>
  );
}
