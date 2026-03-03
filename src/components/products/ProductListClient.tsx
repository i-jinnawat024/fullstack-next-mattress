"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/lib/db/schema";
import { softDeleteProductAction } from "@/app/products/actions";
import { CardListItem } from "@/components/ui/CardListItem";
import { ProductCardLeft } from "@/components/products/ProductCardLeft";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

function formatPrice(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("th-TH").format(n);
}

type ProductListClientProps = {
  rows: ProductRow[];
  /** เมื่อกรองแล้วไม่มีผล (ให้แสดงข้อความต่างจาก "ยังไม่มีสินค้า") */
  emptyState?: { message: string; testId: string };
};

export function ProductListClient({ rows, emptyState }: ProductListClientProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้หรือไม่? (สามารถกู้คืนได้)")) return;
    const { error } = await softDeleteProductAction(id);
    if (error) alert(error);
    else router.refresh();
  };

  return (
    <div className="space-y-3" data-testid="products-list">
      {rows.length === 0 ? (
        <p
          className="py-8 text-center text-[var(--color-text-muted)]"
          data-testid={emptyState?.testId ?? "products-empty"}
        >
          {emptyState?.message ?? "ยังไม่มีสินค้า — กดเพิ่มสินค้า"}
        </p>
      ) : (
        <ul
          className="space-y-3"
          data-testid="products-table"
          aria-label="รายการสินค้า"
        >
          {rows.map((r) => (
            <CardListItem
              key={r.id}
              as="li"
              data-testid={`product-row-${r.id}`}
              left={<ProductCardLeft imageUrl={r.image_url} name={r.name} />}
              center={
                <>
                  <Link
                    href={`/product/${r.id}`}
                    className="font-medium text-[var(--color-primary)] hover:underline truncate"
                    data-testid={`product-name-link-${r.id}`}
                  >
                    {r.name}
                  </Link>
                  <p className="text-sm text-[var(--color-text-muted)]">{r.brand}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-sm text-[var(--color-text-muted)]">
                    <span>3.5 ฟุต: {formatPrice(r.size_3_5_msrp)}</span>
                    <span>5 ฟุต: {formatPrice(r.size_5_msrp)}</span>
                    <span>6 ฟุต: {formatPrice(r.size_6_msrp)}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">ส่วนลด {r.discount_percent}%</p>
                </>
              }
              right={
                <>
                  <Link
                    href={`/products/${r.id}/edit`}
                    className="flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-primary)]"
                    data-testid={`product-edit-${r.id}`}
                    aria-label="แก้ไข"
                    title="แก้ไข"
                  >
                    <Pencil className="h-5 w-5" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] items-center justify-center rounded-lg border border-[var(--color-error)]/50 text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/10"
                    data-testid={`product-delete-${r.id}`}
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
      )}
    </div>
  );
}
