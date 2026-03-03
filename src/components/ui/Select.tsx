"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useId,
} from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

export interface SelectProps {
  /** ตัวเลือกใน dropdown */
  options: SelectOption[];
  /** ค่าที่เลือกอยู่ */
  value: string;
  /** เรียกเมื่อเปลี่ยนค่า */
  onChange: (value: string) => void;
  /** ป้ายกำกับ (แสดงด้านบน) */
  label?: string;
  /** ขนาด: default = toolbar, compact = ตัวกรอง mobile */
  size?: "default" | "compact";
  /** ข้อความเมื่อ value เป็นค่าว่าง */
  placeholder?: string;
  /** สำหรับ test/automation */
  "data-testid"?: string;
  /** accessibility */
  "aria-label"?: string;
  /** class เพิ่มเติมที่ trigger */
  className?: string;
  disabled?: boolean;
}

const triggerClasses = {
  default:
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-3 pr-3 text-left text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none min-h-[var(--touch-min)] flex items-center justify-between gap-2",
  compact:
    "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none flex items-center justify-between gap-2",
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      size = "default",
      placeholder,
      "data-testid": testId,
      "aria-label": ariaLabel,
      className = "",
      disabled = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const listboxId = useId();

    const displayOptions = placeholder
      ? [{ value: "", label: placeholder }, ...options]
      : options;
    const selectedOption = displayOptions.find((o) => o.value === value);
    const selectedLabel = selectedOption?.label ?? placeholder ?? "";

    const close = useCallback(() => {
      setIsOpen(false);
      setHighlightIndex(-1);
    }, []);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, close]);

    useEffect(() => {
      if (!isOpen) return;
      setHighlightIndex(
        Math.max(
          0,
          displayOptions.findIndex((o) => o.value === value)
        )
      );
    }, [isOpen, value, displayOptions.length]);

    useEffect(() => {
      if (!isOpen || highlightIndex < 0) return;
      const el = listRef.current?.querySelector(
        `[data-index="${highlightIndex}"]`
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest" });
    }, [isOpen, highlightIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((i) =>
            i < displayOptions.length - 1 ? i + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((i) =>
            i > 0 ? i - 1 : displayOptions.length - 1
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightIndex >= 0 && displayOptions[highlightIndex]) {
            onChange(displayOptions[highlightIndex].value);
            close();
          }
          break;
        default:
          break;
      }
    };

    const triggerClass = triggerClasses[size];

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    return (
      <div ref={setRef} className="relative flex flex-col gap-1.5">
        {label && size === "default" && (
          <span
            className="text-sm font-medium text-[var(--color-text-muted)]"
            id={testId ? `${testId}-label` : undefined}
          >
            {label}
          </span>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel ?? label ?? undefined}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          className={`${triggerClass} ${className}`}
          data-testid={testId}
        >
          <span className="truncate">
            {selectedLabel || "\u00A0"}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel ?? label ?? undefined}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
            style={{ minWidth: "100%" }}
          >
            {displayOptions.map((opt, i) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  data-index={i}
                  onClick={() => {
                    onChange(opt.value);
                    close();
                  }}
                  className={`w-full px-3 py-2 text-left text-[var(--color-text)] transition-colors ${
                    size === "compact" ? "text-sm" : ""
                  } ${
                    opt.value === value
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                      : "hover:bg-[var(--color-surface-secondary)]"
                  } ${i === highlightIndex ? "bg-[var(--color-surface-secondary)]" : ""}`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
