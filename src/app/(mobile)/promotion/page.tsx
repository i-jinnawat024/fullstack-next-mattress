import Link from "next/link";
import { listPromotions } from "@/lib/data/promotions";
import { PromotionListClient } from "@/components/promotion/PromotionListClient";

export default async function PromotionPage() {
  const promotions = await listPromotions({ activeOnly: false });

  return (
    <div
      className="container-app mx-auto w-full max-w-full py-6 md:py-10"
      data-testid="promotion-page"
    >
      <div className="w-full min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1
            className="text-[var(--text-heading)] md:text-2xl font-bold text-[var(--color-text)]"
            data-testid="promotion-heading"
          >
            โปรโมชั่น
          </h1>
          <Link
            href="/promotion/new"
            className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            data-testid="promotion-add-link"
          >
            สร้างโปรโมชั่น
          </Link>
        </div>

        <div className="space-y-4" data-testid="promotion-list">
          {promotions.length === 0 ? (
            <p
              className="py-8 text-center text-[var(--color-text-muted)]"
              data-testid="promotion-empty"
            >
              ยังไม่มีโปรโมชั่น — กดสร้างโปรโมชั่น
            </p>
          ) : (
            <PromotionListClient promotions={promotions} />
          )}
        </div>
      </div>
    </div>
  );
}
