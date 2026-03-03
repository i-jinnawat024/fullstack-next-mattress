"use client";

import { useRouter } from "next/navigation";
import { ProductAutocomplete } from "@/components/search/ProductAutocomplete";
import type { Product } from "@/types/product";

export default function HomePage() {
  const router = useRouter();

  const handleSelect = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="container-app content-prose mx-auto pt-6 md:pt-10">
      <h1 className="sr-only">Mattress City — ค้นหาราคา</h1>
      <div className="mb-4 md:max-w-xl">
        <ProductAutocomplete onSelect={handleSelect} />
      </div>
      <p className="text-[var(--text-label)] text-[var(--color-text-muted)] text-center md:text-left">
        พิมพ์ชื่อรุ่นหรือแบรนด์ เพื่อดูราคาสุทธิ ของแถม และโปรบัตร
      </p>
    </div>
  );
}
