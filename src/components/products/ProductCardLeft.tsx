/**
 * ช่องซ้ายของ card สินค้า (รูปหรือ placeholder) — ใช้กับ CardListItem
 */
export function ProductCardLeft({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}) {
  return (
    <div className="relative h-full w-full bg-[var(--color-surface-secondary)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)] text-xs"
          aria-hidden
        >
          ไม่มีรูป
        </div>
      )}
    </div>
  );
}
