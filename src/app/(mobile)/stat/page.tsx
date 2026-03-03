import Link from "next/link";
import { getMonthlyTargetsWithSales } from "@/lib/data/sales";

const MONTH_NAMES = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatNum(n: number) {
  return new Intl.NumberFormat("th-TH").format(Math.round(n));
}

export default async function StatPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const rows = await getMonthlyTargetsWithSales(year, month, 12);

  return (
    <div className="container-app content-prose mx-auto py-6 md:py-10">
      <h1 className="text-[var(--text-heading)] md:text-2xl font-bold text-[var(--color-text)] mb-2">
        สถิติยอดขาย
      </h1>
      <p className="text-[var(--text-body)] text-[var(--color-text-muted)] mb-6">
        ยอดขายเทียบกับเป้ารายเดือน
      </p>

      <div className="space-y-4">
        {rows.map((r) => {
          const label = `${MONTH_NAMES[r.month - 1]} ${r.year + 543}`;
          const target = r.target_amount;
          const sales = r.sales_total;
          const pct = target > 0 ? Math.min(100, (sales / target) * 100) : (sales > 0 ? 100 : 0);
          return (
            <article
              key={`${r.year}-${r.month}`}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-medium text-[var(--color-text)]">{label}</span>
                <span className="text-[var(--color-text-muted)]">
                  {formatNum(sales)} / {target > 0 ? formatNum(target) : "—"} บาท
                </span>
              </div>
              {target > 0 && (
                <div
                  className="h-2 rounded-full bg-[var(--color-surface-secondary)] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`ยอดขาย ${label} ${formatNum(pct)} เปอร์เซ็นต์ของเป้า`}
                >
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-[var(--color-text-muted)]">
        ตั้งค่าเป้ารายเดือนได้ที่{" "}
        <Link href="/setting" className="text-[var(--color-primary)] underline">
          ตั้งค่า
        </Link>
      </p>
    </div>
  );
}
