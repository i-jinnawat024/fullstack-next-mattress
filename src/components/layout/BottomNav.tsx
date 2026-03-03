"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "หน้าหลัก", icon: "🏠" },
  { href: "/products", label: "สินค้า", icon: "📦" },
  { href: "/promotion", label: "โปรโมชั่น", icon: "🏷️" },
  { href: "/stat", label: "สถิติ", icon: "📊" },
  { href: "/setting", label: "ตั้งค่า", icon: "⚙️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]"
      style={{ minHeight: "var(--nav-height)" }}
      aria-label="เมนูหลัก"
    >
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] flex-col items-center justify-center gap-0.5 px-3 text-[var(--text-label)] transition-colors focus-visible:outline-offset-2"
            style={{
              color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
              fontWeight: isActive ? 600 : 400,
            }}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-lg" aria-hidden>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
