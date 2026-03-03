"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/products", label: "สินค้า" },
  { href: "/promotion", label: "โปรโมชั่น" },
  { href: "/stat", label: "สถิติ" },
  { href: "/setting", label: "ตั้งค่า" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] md:block"
      style={{ height: "var(--header-height)" }}
    >
      <div className="container-app flex h-full items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-[var(--color-primary)] focus:outline-none rounded px-2 py-1"
        >
          Mattress City
        </Link>
        <nav className="flex items-center gap-1" aria-label="เมนูหลัก">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 min-h-[var(--touch-min)] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                  isActive
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
