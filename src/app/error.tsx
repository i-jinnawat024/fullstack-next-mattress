"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-[var(--text-heading)] font-bold text-[var(--color-text)]">
          เกิดข้อผิดพลาด
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {error.message || "เกิดปัญหาระหว่างโหลดหน้า"}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
