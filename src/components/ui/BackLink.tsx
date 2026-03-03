import Link from "next/link";

const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-muted)] no-underline transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-primary)]";

const textClass =
  "inline-flex min-h-[var(--touch-min)] items-center gap-1.5 rounded-lg text-[var(--color-primary)] no-underline transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

export interface BackLinkProps {
  href?: string;
  children?: React.ReactNode;
  variant?: "pill" | "text";
  className?: string;
  "data-testid"?: string;
}

export function BackLink({
  href = "/products",
  children = (
    <>
      <span aria-hidden>←</span>
      กลับไปรายการสินค้า
    </>
  ),
  variant = "pill",
  className = "",
  "data-testid": dataTestId,
}: BackLinkProps) {
  const baseClass = variant === "pill" ? pillClass : textClass;
  return (
    <Link
      href={href}
      className={`${baseClass} ${className}`.trim()}
      data-testid={dataTestId}
    >
      {children}
    </Link>
  );
}
