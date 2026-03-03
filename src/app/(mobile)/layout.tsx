import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main className="min-h-screen pt-0 md:pt-[var(--header-height)] pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+1rem)] md:pb-10">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
