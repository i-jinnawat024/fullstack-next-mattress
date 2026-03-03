"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
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
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: "ต้องการลบรายการนี้หรือไม่? ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-error)",
      cancelButtonColor: "var(--color-text-muted)",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;
    const { error } = await softDeleteProductAction(id);
    if (error) {
      void Swal.fire({ title: "เกิดข้อผิดพลาด", text: error, icon: "error" });
    } else {
      void Swal.fire({ title: "ลบแล้ว", icon: "success", timer: 1500, showConfirmButton: false });
      router.refresh();
    }
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
                  <div className="mt-1 flex flex-col gap-0.5 text-sm text-[var(--color-text-muted)]">
                    <span>3.5 ฟุต: {formatPrice(r.size_3_5_msrp)}{r.size_3_5_msrp != null ? " บาท" : ""}</span>
                    <span>5 ฟุต: {formatPrice(r.size_5_msrp)}{r.size_5_msrp != null ? " บาท" : ""}</span>
                    <span>6 ฟุต: {formatPrice(r.size_6_msrp)}{r.size_6_msrp != null ? " บาท" : ""}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]" data-testid={`product-is-active-${r.id}`}>
                    {r.is_active ? (
                      <span className="text-[var(--color-success)]">เปิดใช้งาน</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">ปิดใช้งาน</span>
                    )}
                  </p>
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
                    className="flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] cursor-pointer items-center justify-center rounded-lg border border-[var(--color-error)]/50 text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/10"
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
