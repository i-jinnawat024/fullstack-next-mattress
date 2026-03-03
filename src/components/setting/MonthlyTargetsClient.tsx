"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { upsertTargetAction, deleteTargetAction, type SettingFormState } from "@/app/(mobile)/setting/actions";
import type { Database } from "@/lib/db/schema";

type MonthlyTargetRow = Database["public"]["Tables"]["monthly_targets"]["Row"];

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const inputClass =
  "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 px-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-[var(--color-text-muted)]";

function formatNum(n: number) {
  return new Intl.NumberFormat("th-TH").format(Math.round(n));
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-xl">
      {pending ? "กำลังบันทึก..." : "บันทึกเป้า"}
    </Button>
  );
}

export function MonthlyTargetsClient({ targets }: { targets: MonthlyTargetRow[] }) {
  const [state, formAction] = useActionState(upsertTargetAction, {} as SettingFormState);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    if (state?.success) toast.success("บันทึกเป้าหมายแล้ว");
    if (state?.error) toast.error(state.error);
  }, [state?.success, state?.error]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          กำหนดเป้ารายเดือน
        </h2>
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="target-year" className={labelClass}>ปี</label>
            <select id="target-year" name="year" className={inputClass} defaultValue={currentYear}>
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y + 543}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="target-month" className={labelClass}>เดือน</label>
            <select id="target-month" name="month" className={inputClass} defaultValue={currentMonth}>
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="target-amount" className={labelClass}>เป้า (บาท)</label>
            <input
              id="target-amount"
              type="number"
              name="target_amount"
              min={0}
              step={1000}
              className={inputClass}
              placeholder="เช่น 500000"
              required
            />
          </div>
          <SubmitBtn />
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          เป้าหมายที่ตั้งไว้
        </h2>
        {targets.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">ยังไม่มีเป้ารายเดือน — กรอกด้านบนแล้วกดบันทึก</p>
        ) : (
          <ul className="space-y-2">
            {targets.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <span className="text-[var(--color-text)]">
                  {MONTH_NAMES[t.month - 1]} {t.year + 543}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {formatNum(t.target_amount)} บาท
                </span>
                <DeleteTargetButton targetId={t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DeleteTargetButton({ targetId }: { targetId: string }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm("ลบเป้าหมายรายเดือนนี้?")) return;
    setDeleting(true);
    try {
      const res = await deleteTargetAction(targetId);
      if (res?.success) toast.success("ลบแล้ว");
      else if (res?.error) toast.error(res.error);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:underline text-sm disabled:opacity-50"
    >
      {deleting ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}
