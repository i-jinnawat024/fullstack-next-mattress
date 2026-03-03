import { notFound } from "next/navigation";
import Link from "next/link";
import { getCachedProductById } from "@/lib/cache/catalog";
import type { SizeKey } from "@/types/product";
import { QuoteView } from "@/components/product/QuoteView";

const VALID_SIZES: SizeKey[] = ["3.5", "5", "6"];

function formatPrice(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

function formatDate() {
  return new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string }>;
}) {
  const { id } = await params;
  const { size: sizeParam } = await searchParams;
  const product = await getCachedProductById(id);
  if (!product) notFound();

  const size: SizeKey =
    sizeParam && VALID_SIZES.includes(sizeParam as SizeKey)
      ? (sizeParam as SizeKey)
      : (product.prices[0]?.size ?? "5");
  const priceRow = product.prices.find((p) => p.size === size);
  const netPrice = priceRow?.netPrice ?? 0;

  return (
    <div className="container-app mx-auto py-6 md:py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/product/${id}`}
          className="text-[var(--color-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
        >
          ← กลับไปหน้ารายละเอียด
        </Link>
      </div>

      <QuoteView
        productId={id}
        productName={product.name}
        productBrand={product.brand}
        size={size}
        netPrice={netPrice}
        freeGifts={[]}
        creditPromoText={null}
      />

      <div id="quote-print-area" className="quote-content mt-6 rounded-2xl border-2 border-[var(--color-border)] bg-white p-6 md:p-8 print:border print:shadow-none">
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
          Mattress City — ใบเสนอราคา
        </p>
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text)]">
          {product.name}
        </h1>
        <p className="text-[var(--color-text-muted)] mb-4">{product.brand}</p>
        <dl className="space-y-2 text-[var(--color-text)]">
          <div className="flex justify-between">
            <dt>ขนาด</dt>
            <dd>{size} ฟุต</dd>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <dt>ราคาสุทธิ</dt>
            <dd>{formatPrice(netPrice)} บาท</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">
          วันที่ออกใบเสนอราคา: {formatDate()}
        </p>
      </div>
    </div>
  );
}
