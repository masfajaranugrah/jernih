"use client";

import { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function CategorySelect({
  value,
  onChange,
  className = "",
  placeholder = "-- Pilih Kategori --",
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cari label untuk nilai yang dipilih
  function getLabel(id: string): string {
    for (const cat of CATEGORIES) {
      if (cat.id === id) return cat.name;
      for (const sub of cat.children ?? []) {
        if (sub.id === id) return sub.name;
      }
    }
    return placeholder;
  }

  const displayLabel = value ? getLabel(value) : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all outline-none ${
          open
            ? "border-[#003527] ring-2 ring-[#003527]/20 bg-white"
            : "border-[#bfc9c3] bg-[#f8f9fa] hover:border-[#003527]"
        } ${value ? "text-[#191c1d]" : "text-[#9ea5a0]"}`}
      >
        <span className="truncate">{displayLabel}</span>
        <span
          className={`material-symbols-outlined text-base text-[#707974] transition-transform duration-200 shrink-0 ml-2 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-[#e1e3e4] bg-white shadow-lg">
          {/* Opsi kosong */}
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f3f4f5] ${
              !value ? "bg-[#f3f4f5] font-semibold text-[#003527]" : "text-[#9ea5a0]"
            }`}
          >
            {placeholder}
          </button>

          <div className="max-h-60 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <div key={cat.id}>
                {/* Parent — tidak bisa dipilih */}
                <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9ea5a0] bg-[#f8f9fa]">
                  {cat.name}
                </div>
                {/* Children */}
                {(cat.children ?? []).map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => { onChange(sub.id); setOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f3f4f5] flex items-center gap-2 ${
                      value === sub.id
                        ? "bg-[#e8f5e9] text-[#003527] font-semibold"
                        : "text-[#191c1d]"
                    }`}
                  >
                    <span className="text-[#bfc9c3] text-xs shrink-0">└</span>
                    {sub.name}
                    {value === sub.id && (
                      <span className="material-symbols-outlined text-sm text-[#003527] ml-auto">check</span>
                    )}
                  </button>
                ))}
                {/* Jika parent tidak punya children, tampilkan sebagai pilihan */}
                {!cat.children && (
                  <button
                    type="button"
                    onClick={() => { onChange(cat.id); setOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f3f4f5] ${
                      value === cat.id
                        ? "bg-[#e8f5e9] text-[#003527] font-semibold"
                        : "text-[#191c1d]"
                    }`}
                  >
                    {cat.name}
                    {value === cat.id && (
                      <span className="material-symbols-outlined text-sm text-[#003527] float-right">check</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
