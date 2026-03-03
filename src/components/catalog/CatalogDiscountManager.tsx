"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, Search } from "lucide-react";
import type { Product, ProductActivePromotion } from "@/types/product";
import type { Promotion } from "@/types/promotion";
import {
  addProductPromotionAction,
  removeProductPromotionAction,
  reorderProductPromotionsAction,
} from "@/app/(mobile)/catalog/actions";
import { Button } from "@/components/ui/Button";

function formatDiscount(p: ProductActivePromotion | Promotion): string {
  if (p.discountType === "percent") {
    return `ลด ${p.discountValue}%`;
  }
  return `ลด ${new Intl.NumberFormat("th-TH").format(p.discountValue)} บาท`;
}

type Props = {
  product: Product;
  availablePromotions: Promotion[];
  /** เรียกก่อน add เพื่ออัปเดตราคา realtime */
  onOptimisticAdd?: (promo: ProductActivePromotion) => void;
  onAddSuccess?: () => void;
  onAddError?: () => void;
  onOptimisticRemove?: (promotionId: string) => void;
  onRemoveSuccess?: () => void;
  onRemoveError?: () => void;
  onOptimisticReorder?: (reordered: ProductActivePromotion[]) => void;
  onReorderSuccess?: () => void;
  onReorderError?: () => void;
};

export function CatalogDiscountManager({
  product,
  availablePromotions,
  onOptimisticAdd,
  onAddSuccess,
  onAddError,
  onOptimisticRemove,
  onRemoveSuccess,
  onRemoveError,
  onOptimisticReorder,
  onReorderSuccess,
  onReorderError,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");

  const linkedIds = new Set((product.activePromotions ?? []).map((p) => p.id));
  const canAdd = availablePromotions.filter((p) => !linkedIds.has(p.id));
  const searchLower = addSearchQuery.trim().toLowerCase();
  const canAddFiltered =
    searchLower === ""
      ? canAdd
      : canAdd.filter((p) => {
          const name = p.name.toLowerCase();
          const discount = formatDiscount(p).toLowerCase();
          const minOrder =
            p.minOrderAmount != null && p.minOrderAmount > 0
              ? new Intl.NumberFormat("th-TH").format(p.minOrderAmount).toLowerCase()
              : "";
          return (
            name.includes(searchLower) ||
            discount.includes(searchLower) ||
            minOrder.includes(searchLower)
          );
        });
  const list = product.activePromotions ?? [];

  async function handleAdd(promotionId: string) {
    const promo = availablePromotions.find((p) => p.id === promotionId);
    if (promo) {
      const activePromo: ProductActivePromotion = {
        id: promo.id,
        name: promo.name,
        endDate: promo.endDate,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderAmount: promo.minOrderAmount ?? null,
      };
      onOptimisticAdd?.(activePromo);
    }
    setError(null);
    setPending(true);
    const res = await addProductPromotionAction(product.id, promotionId);
    setPending(false);
    if (res.error) {
      setError(res.error);
      onAddError?.();
      return;
    }
    setShowAdd(false);
    setAddSearchQuery("");
    if (onAddSuccess) onAddSuccess();
    else router.refresh();
  }

  async function handleRemove(promotionId: string) {
    onOptimisticRemove?.(promotionId);
    setError(null);
    setPending(true);
    const res = await removeProductPromotionAction(product.id, promotionId);
    setPending(false);
    if (res.error) {
      setError(res.error);
      onRemoveError?.();
      return;
    }
    if (onRemoveSuccess) onRemoveSuccess();
    else router.refresh();
  }

  async function handleMove(index: number, direction: "up" | "down") {
    if (list.length <= 1) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const reordered = [...list];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, removed);
    onOptimisticReorder?.(reordered);
    setError(null);
    setPending(true);
    const res = await reorderProductPromotionsAction(
      product.id,
      reordered.map((p) => p.id)
    );
    setPending(false);
    if (res.error) {
      setError(res.error);
      onReorderError?.();
      return;
    }
    if (onReorderSuccess) onReorderSuccess();
    else router.refresh();
  }

  return (
    <section
      className="rounded-xl border-2 border-[var(--color-primary)]/25 bg-[var(--color-surface-secondary)] p-4 md:p-5"
      aria-label="จัดการส่วนลด"
      data-testid="catalog-discount-manager"
    >
      <h2 className="mb-3 font-semibold text-[var(--color-primary)] md:text-xl">
        จัดการส่วนลด
      </h2>
      {error && (
        <p
          className="mb-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]"
          role="alert"
          data-testid="catalog-discount-manager-error"
        >
          {error}
        </p>
      )}
      <ul className="space-y-2 md:space-y-3" data-testid="catalog-discount-list">
        {list.map((p, index) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2 last:border-0 md:py-3"
            data-testid={`catalog-discount-row-${p.id}`}
          >
            <div className="flex flex-1 flex-wrap items-baseline gap-2">
              <span className="font-medium text-[var(--color-text)]">{p.name}</span>
              <span className="text-[var(--color-primary)] font-semibold">
                {formatDiscount(p)}
              </span>
              {p.minOrderAmount != null && p.minOrderAmount > 0 && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  (ราคาขั้นต่ำ {new Intl.NumberFormat("th-TH").format(p.minOrderAmount)} บาท)
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(index, "up")}
                disabled={pending || index === 0}
                className="rounded p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] disabled:opacity-50"
                aria-label="เลื่อนขึ้น"
                data-testid={`catalog-discount-move-up-${p.id}`}
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, "down")}
                disabled={pending || index === list.length - 1}
                className="rounded p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] disabled:opacity-50"
                aria-label="เลื่อนลง"
                data-testid={`catalog-discount-move-down-${p.id}`}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(p.id)}
                disabled={pending}
                className="rounded p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] disabled:opacity-50"
                aria-label={`ลบโปร ${p.name}`}
                data-testid={`catalog-discount-remove-${p.id}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        {!showAdd ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowAdd(true)}
            disabled={pending}
            className="gap-2"
            data-testid="catalog-discount-add-button"
          >
            <Plus className="h-4 w-4" aria-hidden />
            เพิ่มส่วนลด
          </Button>
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3" data-testid="catalog-discount-add-picker">
            <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
              เลือกโปรโมชั่น
            </p>
            {canAdd.length > 0 && (
              <div className="relative mb-3">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  placeholder="ค้นหาโปรโมชั่น..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  aria-label="ค้นหาโปรโมชั่น"
                  data-testid="catalog-discount-add-search"
                />
              </div>
            )}
            {canAdd.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                ไม่มีโปรที่เลือกเพิ่มได้ (ผูกครบหรือไม่มีโปรที่เปิดอยู่)
              </p>
            ) : canAddFiltered.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]" data-testid="catalog-discount-add-no-results">
                ไม่พบโปรโมชั่นที่ตรงกับ &quot;{addSearchQuery.trim()}&quot;
              </p>
            ) : (
              <ul className="space-y-1">
                {canAddFiltered.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(p.id)}
                      disabled={pending}
                      className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)] disabled:opacity-50"
                      data-testid={`catalog-discount-select-${p.id}`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-[var(--color-primary)]">
                        {formatDiscount(p)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAdd(false);
                setAddSearchQuery("");
              }}
              disabled={pending}
              className="mt-2"
              data-testid="catalog-discount-add-cancel"
            >
              ยกเลิก
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
