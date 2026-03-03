"use client";

import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { UploadDropzone } from "@/lib/uploadthing";
import type { ProductFormState } from "@/app/products/actions";

const CUSTOM_BRAND_VALUE = "__custom__";

type ProductFormProps = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  /** รายการแบรนด์จาก DB (สำหรับ dropdown) */
  brands: string[];
  /** สำหรับหน้าแก้ไข: ส่ง id เพื่อใส่ใน formData (hidden) */
  id?: string;
  initial?: {
    name: string;
    brand: string;
    image_url: string | null;
    size_3_5_msrp: number | null;
    size_5_msrp: number | null;
    size_6_msrp: number | null;
  };
};

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-primary)] focus:outline-none";
const labelClass =
  "mb-1.5 block text-[var(--text-label)] font-medium text-[var(--color-text-muted)]";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl py-3 font-medium md:max-w-xs"
      data-testid="product-form-submit"
    >
      {pending ? "กำลังบันทึก..." : "บันทึก"}
    </Button>
  );
}

export function ProductForm({ action, brands, id, initial }: ProductFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, {} as ProductFormState);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const initialBrand = initial?.brand ?? "";
  const isInitialCustom = initialBrand && !brands.includes(initialBrand);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    isInitialCustom ? CUSTOM_BRAND_VALUE : initialBrand || (brands[0] ?? CUSTOM_BRAND_VALUE)
  );
  const [customBrand, setCustomBrand] = useState<string>(isInitialCustom ? initialBrand : "");
  const brandValue = selectedBrand === CUSTOM_BRAND_VALUE ? customBrand : selectedBrand;
  const [imageOverlayOpen, setImageOverlayOpen] = useState(false);

  useEffect(() => {
    if (!imageOverlayOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImageOverlayOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [imageOverlayOpen]);

  useEffect(() => {
    if (!state?.success) return;
    toast.success(initial ? "บันทึกแล้ว" : "เพิ่มสินค้าแล้ว");
    router.push("/products");
  }, [state?.success, initial, router]);

  const handleUploadComplete = useCallback((res: { url?: string }[]) => {
    setUploadingImage(false);
    setUploadProgress(0);
    setUploadError(null);
    if (res?.[0]?.url) setImageUrl(res[0].url);
  }, []);

  const handleUploadError = useCallback((err: Error) => {
    setUploadingImage(false);
    setUploadProgress(0);
    setUploadError(err?.message ?? "อัปโหลดไม่สำเร็จ");
  }, []);

  const handleUploadBegin = useCallback(() => {
    setUploadError(null);
    setUploadingImage(true);
    setUploadProgress(0);
  }, []);

  const handleUploadProgress = useCallback((p: number | { file?: string; progress?: number }) => {
    const value = typeof p === "number" ? p : p?.progress ?? 0;
    setUploadProgress(value);
  }, []);

  return (
    <form
      action={formAction}
      className="space-y-6"
      data-testid="product-form"
      noValidate
    >
      {id != null && <input type="hidden" name="id" value={id} />}
      {state?.error && (
        <div
          className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]"
          data-testid="product-form-error"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {/* ข้อมูลสินค้า */}
      <section
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-5 md:p-6"
        aria-labelledby="product-info-heading"
        data-testid="product-form-section-info"
      >
        <h2
          id="product-info-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        >
          ข้อมูลสินค้า
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              ชื่อรุ่น <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={initial?.name}
              className={inputClass}
              placeholder="เช่น หมอนหนุนคอ Memory Foam"
              data-testid="product-form-name"
            />
          </div>

          <div>
            <label htmlFor="brand" className={labelClass}>
              แบรนด์ <span className="text-[var(--color-error)]">*</span>
            </label>
          <Select
            options={[
              ...brands.map((b) => ({ value: b, label: b })),
              { value: CUSTOM_BRAND_VALUE, label: "เพิ่มแบรนด์ใหม่..." },
            ]}
            value={selectedBrand}
            onChange={setSelectedBrand}
            placeholder="-- เลือกแบรนด์ --"
            aria-label="เลือกแบรนด์จากรายการหรือเพิ่มแบรนด์ใหม่"
            data-testid="product-form-brand"
          />
          {selectedBrand === CUSTOM_BRAND_VALUE ? (
            <input
              id="brand-custom"
              name="brand"
              type="text"
              value={customBrand}
              onChange={(e) => setCustomBrand(e.target.value)}
              placeholder="เช่น Sealy, King Koil"
              className={`${inputClass} mt-2`}
              data-testid="product-form-brand-custom"
              aria-label="ระบุชื่อแบรนด์ใหม่"
              required
            />
          ) : (
            <input type="hidden" name="brand" value={brandValue} />
          )}
        </div>

        <div data-testid="product-form-image">
          <span className={labelClass}>รูปสินค้า</span>
          {uploadingImage && (
            <div className="mt-2 space-y-2" role="status" data-testid="product-form-image-status" aria-live="polite">
              <p className="text-sm text-[var(--color-primary)]">
                กำลังอัปโหลด... {uploadProgress > 0 && `${uploadProgress}%`}
              </p>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                  data-testid="product-form-image-progress"
                />
              </div>
            </div>
          )}
          {imageUrl ? (
            <div className="mt-2">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setImageOverlayOpen(true)}
                  className="block cursor-pointer rounded-xl border border-[var(--color-border)] ring-[var(--color-primary)] transition-shadow hover:ring-2 focus:outline-none focus:ring-2 text-left"
                  title="คลิกดูรูปขนาดใหญ่"
                  aria-label="คลิกดูรูปขนาดใหญ่"
                >
                  <img
                    src={imageUrl}
                    alt="รูปสินค้า"
                    className="h-40 w-40 cursor-pointer rounded-xl object-cover pointer-events-none"
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl(null);
                  }}
                  className="absolute -right-1 -top-1 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-sm transition-colors hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  title="ลบรูป"
                  aria-label="ลบรูป"
                  data-testid="product-form-image-remove"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
              <input type="hidden" name="image_url" value={imageUrl} />

              {imageOverlayOpen && (
                <div
                  className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/70 p-4"
                  role="dialog"
                  aria-modal="true"
                  aria-label="ดูรูปสินค้า"
                  onClick={() => setImageOverlayOpen(false)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageOverlayOpen(false);
                    }}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-700 transition hover:bg-white"
                    aria-label="ปิด"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <img
                    src={imageUrl}
                    alt="รูปสินค้า"
                    className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 w-full [&_[data-state]]:!min-h-0 [&_[data-state]]:!p-0">
              {uploadError && (
                <p className="mb-2 text-sm text-[var(--color-error)]" role="alert">
                  {uploadError}
                </p>
              )}
              <UploadDropzone
                endpoint="productImage"
                config={{ mode: "auto" }}
                onUploadBegin={handleUploadBegin}
                onUploadProgress={handleUploadProgress}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                uploadProgressGranularity="fine"
                appearance={{
                  container:
                    "!min-h-[140px] !rounded-2xl !border-2 !border-dashed !border-[var(--color-border)] !bg-[var(--color-surface)]/60 !p-6 cursor-pointer transition-all duration-200 ut-ready:!border-[var(--color-primary)] ut-ready:!bg-[var(--color-primary)]/5 ut-uploading:!border-[var(--color-primary)] ut-uploading:!bg-[var(--color-primary)]/5 hover:ut-ready:!border-[var(--color-primary)] hover:ut-ready:!bg-[var(--color-primary)]/10",
                  label:
                    "!text-[var(--color-text)] !text-sm font-medium",
                  allowedContent:
                    "!text-xs !text-[var(--color-text-muted)]",
                  button:
                    "ut-ready:!bg-[var(--color-primary)] ut-ready:!text-white ut-uploading:!bg-[var(--color-primary)]/80 ut-uploading:!text-white !rounded-lg !px-4 !py-2 !text-sm font-medium transition-colors",
                  uploadIcon: "!w-8 !h-8 !text-[var(--color-primary)]",
                }}
                content={{
                  label: "เลือกรูปหรือลากวางที่นี่",
                  allowedContent: "JPG, PNG สูงสุด 4MB",
                  button: "เลือกไฟล์",
                }}
              />
            </div>
          )}
          </div>
        </div>
      </section>

      {/* ราคาตามขนาด */}
      <section
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 p-5 md:p-6"
        aria-labelledby="product-prices-heading"
        data-testid="product-form-section-prices"
      >
        <h2
          id="product-prices-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        >
          ราคาป้าย (บาท)
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          กรอกเฉพาะขนาดที่มีขาย (ไม่บังคับทุกช่อง)
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="size_3_5_msrp" className={labelClass}>
              3.5 ฟุต
            </label>
            <input
              id="size_3_5_msrp"
              name="size_3_5_msrp"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.size_3_5_msrp ?? ""}
              className={inputClass}
              placeholder="0"
              data-testid="product-form-size-3-5"
            />
          </div>
          <div>
            <label htmlFor="size_5_msrp" className={labelClass}>
              5 ฟุต
            </label>
            <input
              id="size_5_msrp"
              name="size_5_msrp"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.size_5_msrp ?? ""}
              className={inputClass}
              placeholder="0"
              data-testid="product-form-size-5"
            />
          </div>
          <div>
            <label htmlFor="size_6_msrp" className={labelClass}>
              6 ฟุต
            </label>
            <input
              id="size_6_msrp"
              name="size_6_msrp"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.size_6_msrp ?? ""}
              className={inputClass}
              placeholder="0"
              data-testid="product-form-size-6"
            />
          </div>
        </div>
      </section>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
