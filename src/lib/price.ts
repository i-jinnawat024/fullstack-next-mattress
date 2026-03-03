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
