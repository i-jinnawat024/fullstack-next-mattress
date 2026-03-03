export default function MobileLoading() {
  return (
    <div className="container-app mx-auto flex min-h-[40vh] items-center justify-center py-6 md:py-10">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"
        aria-hidden
      />
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}
