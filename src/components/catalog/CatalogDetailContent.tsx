"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { CatalogDiscountManager } from "@/components/catalog/CatalogDiscountManager";
import { computeStackedNetPrice, discountPercentFromNet } from "@/lib/price";
import type { Product, ProductActivePromotion, PriceBySize } from "@/types/product";
import type { Promotion } from "@/types/promotion";

type Props = {
  product: Product;
  availablePromotions: Promotion[];
};

function toStackFormat(p: ProductActivePromotion): { discountType: "percent" | "fixed"; discountValue: number; minOrderAmount?: number | null } {
  return {
    discountType: p.discountType,
    discountValue: p.discountValue,
    minOrderAmount: p.minOrderAmount ?? null,
  };
}

function computePricesFromPromotions(
  prices: PriceBySize[],
  promotions: ProductActivePromotion[]
): PriceBySize[] {
  if (promotions.length === 0) {
    return prices;
  }
  const stack = promotions.map(toStackFormat);
  return prices.map((p) => {
    const netPrice = computeStackedNetPrice(p.msrp, stack);
    const discountPercent = discountPercentFromNet(p.msrp, netPrice);
    return {
      size: p.size,
      msrp: p.msrp,
      discountPercent,
      netPrice,
    };
  });
}

export function CatalogDetailContent({ product, availablePromotions }: Props) {
  const router = useRouter();
  const [optimisticPromotions, setOptimisticPromotions] = useState<ProductActivePromotion[] | null>(null);

  const effectivePromotions = optimisticPromotions ?? product.activePromotions ?? [];
  const effectivePrices = useMemo(
    () => computePricesFromPromotions(product.prices, effectivePromotions),
    [product.prices, effectivePromotions]
  );

  // เคลียร์ optimistic เมื่อข้อมูลจาก server มาครบแล้ว (ไม่ให้มี 2 จังหวะคำนวณ)
  useEffect(() => {
    if (optimisticPromotions == null) return;
    const server = product.activePromotions ?? [];
    if (
      server.length === optimisticPromotions.length &&
      server.every((p, i) => p.id === optimisticPromotions[i]?.id)
    ) {
      setOptimisticPromotions(null);
    }
  }, [product.activePromotions, optimisticPromotions]);

  const productWithEffectivePromos: Product = useMemo(
    () => ({ ...product, activePromotions: effectivePromotions }),
    [product, effectivePromotions]
  );

  const handleOptimisticAdd = (promo: ProductActivePromotion) => {
    setOptimisticPromotions((prev) => [...(prev ?? product.activePromotions ?? []), promo]);
  };

  const handleAddSuccess = () => {
    router.refresh();
  };

  const handleAddError = () => {
    setOptimisticPromotions(null);
  };

  const handleOptimisticRemove = (promotionId: string) => {
    setOptimisticPromotions((prev) => {
      const list = prev ?? product.activePromotions ?? [];
      return list.filter((p) => p.id !== promotionId);
    });
  };

  const handleRemoveSuccess = () => {
    router.refresh();
  };

  const handleRemoveError = () => {
    setOptimisticPromotions(null);
  };

  const handleOptimisticReorder = (reordered: ProductActivePromotion[]) => {
    setOptimisticPromotions(reordered);
  };

  const handleReorderSuccess = () => {
    router.refresh();
  };

  const handleReorderError = () => {
    setOptimisticPromotions(null);
  };

  const hasDiscountMatch =
    effectivePromotions.length > 0 || effectivePrices.some((p) => p.discountPercent > 0);

  return (
    <div className="space-y-6 p-6">
      <section aria-label="ราคาหลังหักส่วนลด" data-testid="catalog-detail-price-section">
        <PriceDisplay prices={effectivePrices} />
      </section>
      {hasDiscountMatch && (
        <p
          className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]"
          data-testid="catalog-detail-has-discount"
        >
          <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>สินค้านี้มีส่วนลดที่จับคู่กับโปรโมชั่นอยู่</span>
        </p>
      )}
      <CatalogDiscountManager
        product={productWithEffectivePromos}
        availablePromotions={availablePromotions}
        onOptimisticAdd={handleOptimisticAdd}
        onAddSuccess={handleAddSuccess}
        onAddError={handleAddError}
        onOptimisticRemove={handleOptimisticRemove}
        onRemoveSuccess={handleRemoveSuccess}
        onRemoveError={handleRemoveError}
        onOptimisticReorder={handleOptimisticReorder}
        onReorderSuccess={handleReorderSuccess}
        onReorderError={handleReorderError}
      />
    </div>
  );
}
