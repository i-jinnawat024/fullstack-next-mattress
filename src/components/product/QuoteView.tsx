"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import type { SizeKey } from "@/types/product";

type QuoteViewProps = {
  productId: string;
  productName: string;
  productBrand: string;
  size: SizeKey;
  netPrice: number;
  freeGifts: string[];
  creditPromoText: string | null;
};

export function QuoteView(_props: QuoteViewProps) {
  const { productId } = _props;
  const quoteBase = `/product/${productId}/quote`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("คัดลอกลิงก์แล้ว — ส่งให้ลูกค้าได้");
    } catch {
      toast.error("คัดลอกลิงก์ไม่ได้");
    }
  };

  return (
    <div className="quote-toolbar flex flex-wrap items-center gap-2 mb-4 print:hidden">
      <span className="text-[var(--color-text-muted)] text-sm mr-2">ขนาด:</span>
      {(["3.5", "5", "6"] as const).map((s) => (
        <Link
          key={s}
          href={`${quoteBase}?size=${s}`}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)]"
        >
          {s} ฟุต
        </Link>
      ))}
      <div className="flex-1" />
      <Button variant="secondary" onClick={handlePrint} type="button" className="rounded-xl">
        พิมพ์ใบเสนอราคา
      </Button>
      <Button variant="primary" onClick={handleCopyLink} type="button" className="rounded-xl">
        คัดลอกลิงก์ส่งลูกค้า
      </Button>
    </div>
  );
}
