/**
 * Price calculator: Net Price from MSRP and discount % or fixed
 */

export function computeNetPrice(msrp: number, discountPercent: number): number {
  if (msrp <= 0) return 0;
  const multiplier = 1 - discountPercent / 100;
  return Math.round(msrp * multiplier);
}

/** Net price when applying a promotion (percent or fixed discount) */
export function computeNetPriceFromPromotion(
  msrp: number,
  discountType: "percent" | "fixed",
  discountValue: number
): number {
  if (msrp <= 0) return 0;
  if (discountType === "fixed") {
    return Math.max(0, Math.round(msrp - discountValue));
  }
  return computeNetPrice(msrp, discountValue);
}

/** Effective discount for display: percent equivalent so discountPercent = (msrp - net) / msrp * 100 */
export function discountPercentFromNet(msrp: number, netPrice: number): number {
  if (msrp <= 0) return 0;
  const p = ((msrp - netPrice) / msrp) * 100;
  return Math.round(Math.max(0, Math.min(100, p)) * 100) / 100;
}

/** Input for stacked discount: โปรเรียงตาม application_order */
export type PromotionForStack = {
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount?: number | null;
};

/**
 * คำนวณราคาสุทธิจาก MSRP โดยสะสมส่วนลดตามลำดับที่ใส่
 * แต่ละโปร: ถ้า minOrderAmount เป็น null หรือ price ปัจจุบัน >= minOrderAmount จึง apply
 * fixed = ลบจาก price, percent = ลด % จาก price ปัจจุบัน
 */
export function computeStackedNetPrice(
  msrp: number,
  promotions: PromotionForStack[]
): number {
  if (msrp <= 0) return 0;
  let price = msrp;
  for (const p of promotions) {
    const min = p.minOrderAmount ?? 0;
    if (price < min) continue;
    if (p.discountType === "fixed") {
      price = Math.max(0, Math.round(price - p.discountValue));
    } else {
      price = Math.round(price * (1 - p.discountValue / 100));
    }
  }
  return price;
}

/** Pick the best active promotion (lowest net price) using a representative MSRP */
export function getBestPromotionForPrice(
  promotions: { discountType: "percent" | "fixed"; discountValue: number }[],
  representativeMsrp: number
): { discountType: "percent" | "fixed"; discountValue: number } | null {
  if (!promotions.length || representativeMsrp <= 0) return null;
  let best = promotions[0];
  let bestNet = computeNetPriceFromPromotion(
    representativeMsrp,
    best.discountType,
    best.discountValue
  );
  for (let i = 1; i < promotions.length; i++) {
    const p = promotions[i];
    const net = computeNetPriceFromPromotion(representativeMsrp, p.discountType, p.discountValue);
    if (net < bestNet) {
      bestNet = net;
      best = p;
    }
  }
  return best;
}
