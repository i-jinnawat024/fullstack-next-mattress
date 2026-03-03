"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Promotion } from "@/types/promotion";
import { CardListItem } from "@/components/ui/CardListItem";
import { DiscountBadge } from "@/components/promotion/DiscountBadge";
import { deletePromotionAction } from "@/app/(mobile)/promotion/actions";

function formatDate(s: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(s));
}

export function PromotionListClient({ promotions }: { promotions: Promotion[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบโปรโมชั่นนี้หรือไม่?")) return;
    const { error } = await deletePromotionAction(id);
    if (error) alert(error);
    else router.refresh();
  };

  return (
    <ul
      className="flex flex-col gap-4 sm:gap-5"
      aria-label="รายการโปรโมชั่น"
    >
      {promotions.map((p) => (
        <CardListItem
          key={p.id}
          as="li"
          data-testid={`promotion-card-${p.id}`}
          left={<DiscountBadge p={p} />}
          center={
            <>
              <h2 className="font-semibold text-[var(--color-text)] truncate">
                {p.name}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(p.startedDate)} – {formatDate(p.endDate)}
              </p>
              {p.description && (
                <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                  {p.description}
                </p>
              )}
              <span
                className={`mt-2 inline-block w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                  p.isActive
                    ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                    : "bg-[var(--color-text-muted)]/15 text-[var(--color-text-muted)]"
                }`}
              >
                {p.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </span>
            </>
          }
          right={
            <>
              <Link
                href={`/promotion/${p.id}/edit`}
                className="flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-primary)]"
                data-testid={`promotion-edit-${p.id}`}
                aria-label="แก้ไข"
                title="แก้ไข"
              >
                <Pencil className="h-5 w-5" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] items-center justify-center rounded-lg border border-[var(--color-error)]/50 text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/10"
                data-testid={`promotion-delete-${p.id}`}
                aria-label="ลบ"
                title="ลบ"
              >
                <Trash2 className="h-5 w-5" aria-hidden />
              </button>
            </>
          }
        />
      ))}
    </ul>
  );
}
