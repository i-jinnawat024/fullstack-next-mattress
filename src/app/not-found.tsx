import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-[var(--text-heading)] font-bold text-[var(--color-text)]">
          ไม่พบหน้า
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          หน้าที่คุณต้องการอาจถูกลบหรือย้ายแล้ว
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
