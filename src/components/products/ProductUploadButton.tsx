"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { FileSpreadsheet, X, Download, Check, FileUp } from "lucide-react";

const TEMPLATE_HEADERS = [
  "ชื่อ",
  "แบรนด์",
  "ราคา 3.5 ฟุต",
  "ราคา 5 ฟุต",
  "ราคา 6 ฟุต",
];
const TEMPLATE_SAMPLE_ROW = [
  "ตัวอย่างที่นอน A",
  "แบรนด์ตัวอย่าง",
  "10000",
  "15000",
  "18000",
];

const PREVIEW_LABELS = ["ชื่อ", "แบรนด์", "ราคา 3.5 ฟุต", "ราคา 5 ฟุต", "ราคา 6 ฟุต"];

/** แสดงค่าตามลำดับคอลัมน์ (รองรับกรณีหัวคอลัมน์เป็น encoding ผิดแบบ mojibake) */
function getCellByIndex(row: Record<string, unknown>, index: number): string {
  const values = Object.values(row);
  const v = values[index];
  if (v === undefined || v === null) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

function downloadTemplateCsv() {
  const header = TEMPLATE_HEADERS.join(",");
  const sample = TEMPLATE_SAMPLE_ROW.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
  const csv = "\uFEFF" + header + "\n" + sample;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_สินค้า.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTemplateXlsx() {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROW]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "สินค้า");
  XLSX.writeFile(wb, "template_สินค้า.xlsx");
}

export function ProductUploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[] | null>(null);

  const parseFile = useCallback(async (file: File): Promise<Record<string, unknown>[]> => {
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
      throw new Error("รองรับเฉพาะไฟล์ .xlsx หรือ .csv");
    }
    let wb: XLSX.WorkBook;
    if (ext === "csv") {
      const text = await file.text();
      wb = XLSX.read(text, { type: "string", raw: false });
    } else {
      const buf = await file.arrayBuffer();
      wb = XLSX.read(new Uint8Array(buf), { type: "array" });
    }
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    if (!firstSheet) throw new Error("ไม่มีชีตในไฟล์");
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
      defval: "",
      raw: false,
    });
    if (rows.length === 0) throw new Error("ไม่พบแถวข้อมูลในไฟล์ (แถวแรกเป็นหัวคอลัมน์)");
    return rows;
  }, []);

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setMessage(null);
      setUploading(true);
      try {
        const rows = await parseFile(file);
        setPreviewRows(rows);
        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
        });
        if (inputRef.current) inputRef.current.value = "";
      } finally {
        setUploading(false);
      }
    },
    [parseFile]
  );

  const handleConfirmUpload = useCallback(async () => {
    if (!previewRows || previewRows.length === 0) return;
    setMessage(null);
    setUploading(true);
    try {
      const res = await fetch("/api/products/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: previewRows }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data?.error ?? "อัปโหลดไม่สำเร็จ" });
        return;
      }

      const { created = 0, skipped = 0, errors = [] } = data;
      const errText =
        errors.length > 0
          ? ` (${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "..." : ""})`
          : "";
      setMessage({
        type: "success",
        text: `เพิ่มสินค้า ${created} รายการ${skipped ? `, ข้าม ${skipped} แถว` : ""}${errText}`,
      });
      setPreviewRows(null);
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
      });
    } finally {
      setUploading(false);
    }
  }, [previewRows, router]);

  const handleBackToDropzone = useCallback(() => {
    setPreviewRows(null);
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file ?? null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage(null);
          setPreviewRows(null);
        }}
        disabled={uploading}
        className="inline-flex min-h-[var(--touch-min)] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-medium text-[var(--color-text)] transition-opacity hover:opacity-90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        data-testid="products-upload-button"
      >
        <FileSpreadsheet className="h-5 w-5 text-[var(--color-text-muted)]" />
        อัพโหลดไฟล์
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!uploading) {
                setOpen(false);
                setPreviewRows(null);
              }
            }}
            aria-hidden
          />
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl"
            data-testid="products-upload-modal"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="upload-modal-title"
                className="text-lg font-semibold text-[var(--color-text)]"
              >
                อัพโหลดไฟล์สินค้า
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!uploading) {
                    setOpen(false);
                    setPreviewRows(null);
                  }
                }}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)] focus:outline-none disabled:opacity-50"
                aria-label="ปิด"
                disabled={uploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onInputChange}
              className="hidden"
              aria-label="เลือกไฟล์ xlsx หรือ csv"
              data-testid="products-upload-input"
            />

            {previewRows != null && previewRows.length > 0 ? (
              <>
                <p className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                  ตัวอย่างข้อมูลที่จะเพิ่ม ({previewRows.length} แถว) — ตรวจสอบแล้วกดยืนยัน
                </p>
                <div
                  className="max-h-[240px] overflow-auto rounded-xl border border-[var(--color-border)]"
                  data-testid="products-upload-preview"
                >
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead className="sticky top-0 bg-[var(--color-surface-secondary)]">
                      <tr>
                        {PREVIEW_LABELS.map((label, idx) => (
                          <th
                            key={idx}
                            className="border-b border-[var(--color-border)] px-3 py-2 font-medium text-[var(--color-text-muted)]"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                          {PREVIEW_LABELS.map((_, colIdx) => {
                            const val = getCellByIndex(row as Record<string, unknown>, colIdx);
                            return (
                              <td
                                key={colIdx}
                                className="max-w-[120px] truncate px-3 py-2 text-[var(--color-text)]"
                                title={val}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmUpload}
                    disabled={uploading}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="products-upload-confirm"
                  >
                    {uploading ? (
                      "กำลังเพิ่ม..."
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        ยืนยันเพิ่ม
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToDropzone}
                    disabled={uploading}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] focus:outline-none disabled:opacity-60"
                    data-testid="products-upload-back"
                  >
                    <FileUp className="h-4 w-4" />
                    เลือกไฟล์ใหม่
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() => !uploading && inputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
                    dragOver
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-surface-secondary)]/50 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-secondary)]"
                  } ${uploading ? "pointer-events-none opacity-70" : ""}`}
                  data-testid="products-upload-dropzone"
                >
                  <FileSpreadsheet className="h-10 w-10 text-[var(--color-text-muted)]" />
                  <p className="text-center text-sm font-medium text-[var(--color-text)]">
                    {uploading ? "กำลังอ่านไฟล์..." : "ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์"}
                  </p>
                  <p className="text-center text-xs text-[var(--color-text-muted)]">
                    รองรับ .xlsx, .xls, .csv
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/30 p-4">
                  <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
                    ดาวน์โหลดเทมเพลต
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={downloadTemplateCsv}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] focus:outline-none"
                      data-testid="products-upload-download-csv"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={downloadTemplateXlsx}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] focus:outline-none"
                      data-testid="products-upload-download-xlsx"
                    >
                      <Download className="h-4 w-4" />
                      Excel (.xlsx)
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    แถวแรกเป็นหัวคอลัมน์ (ชื่อ, แบรนด์, ราคา 3.5/5/6 ฟุต). รูปและส่วนลดแก้ไขในระบบภายหลังได้
                  </p>
                </div>
              </>
            )}

            {message && (
              <p
                className={`mt-4 text-sm ${message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
                data-testid="products-upload-message"
                role="status"
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
