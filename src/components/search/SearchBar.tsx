"use client";

import { useCallback, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "ค้นหารุ่นหรือแบรนด์...",
  defaultValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(value.trim());
    },
    [value, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="product-search" className="sr-only">
        ค้นหารุ่นที่นอนหรือแบรนด์
      </label>
      <input
        id="product-search"
        type="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-[var(--text-body)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        aria-describedby="search-hint"
      />
      <p id="search-hint" className="sr-only">
        พิมพ์ชื่อรุ่นหรือแบรนด์ แล้วกด Enter หรือรอผลอัตโนมัติ
      </p>
    </form>
  );
}
