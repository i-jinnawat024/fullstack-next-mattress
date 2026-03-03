import { listMonthlyTargets } from "@/lib/data/sales";
import { MonthlyTargetsClient } from "@/components/setting/MonthlyTargetsClient";

export default async function SettingPage() {
  const targets = await listMonthlyTargets();

  return (
    <div className="container-app content-prose mx-auto py-6 md:py-10">
      <h1 className="text-[var(--text-heading)] md:text-2xl font-bold text-[var(--color-text)] mb-4">
        ตั้งค่า
      </h1>
      <p className="text-[var(--text-body)] text-[var(--color-text-muted)] mb-6">
        กำหนดเป้ายอดขายรายเดือน — ดูสถิติเทียบเป้าได้ที่หน้าสถิติ
      </p>
      <MonthlyTargetsClient targets={targets} />
    </div>
  );
}
