"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Tag, BarChart3, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Catalog", icon: LayoutGrid },
  { href: "/products", label: "Products", icon: Package },
  { href: "/promotion", label: "Promotion", icon: Tag },
  { href: "/stat", label: "Stats", icon: BarChart3 },
  { href: "/setting", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]"
      style={{ minHeight: "var(--nav-height)" }}
      aria-label="Main menu"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
            <Icon className="size-5 shrink-0" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
