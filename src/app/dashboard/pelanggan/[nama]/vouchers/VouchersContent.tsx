"use client";

import { useEffect, useState } from "react";

type ApiVoucher = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minPurchase: string;
  maxDiscount: string | null;
  quota: number;
  usedCount: number;
  endDate: string | null;
  used: boolean;
};

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp" + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDate(iso: string | null) {
  if (!iso) return "Tanpa batas waktu";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function VouchersContent() {
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vouchers", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Gagal memuat voucher");
        }
        return res.json();
      })
      .then((data: ApiVoucher[]) => {
        if (!cancelled) setVouchers(Array.isArray(data) ? data : []);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function copyCode(v: ApiVoucher) {
    try {
      await navigator.clipboard.writeText(v.code);
      setCopiedId(v.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback untuk browser lama
      const el = document.createElement("textarea");
      el.value = v.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(v.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-[#707974]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
          <span className="text-sm font-medium">Memuat voucher...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm font-semibold text-[#93000a]">
          {error}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">confirmation_number</span>
          <p className="text-[#707974] text-base">Belum ada voucher tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className={`flex overflow-hidden rounded-xl bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border transition-all ${
                v.used ? "border-[#e1e3e4] opacity-60" : "border-transparent hover:border-[#bfc9c3]"
              }`}
            >
              {/* Kiri: nilai potongan */}
              <div className={`relative flex w-32 shrink-0 flex-col items-center justify-center px-3 py-8 ${v.used ? "bg-[#707974]" : "bg-[#064e3b]"}`}>
                <span className="text-white font-black text-2xl leading-tight text-center">
                  {v.type === "PERCENTAGE" ? `${parseFloat(v.value)}%` : formatRupiah(v.value)}
                </span>
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">OFF</span>
                {/* Gerigi tiket */}
                <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#f8f9fa]" />
              </div>

              {/* Kanan: detail */}
              <div className="flex-1 p-5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[#191c1d] font-semibold text-base leading-tight">
                      {v.description || `Potongan ${v.type === "PERCENTAGE" ? `${parseFloat(v.value)}%` : formatRupiah(v.value)}`}
                    </p>
                    <p className="mt-1 text-xs text-[#707974]">
                      Min. belanja {formatRupiah(v.minPurchase)}
                      {v.maxDiscount ? ` • Maks. potongan ${formatRupiah(v.maxDiscount)}` : ""}
                    </p>
                  </div>
                  {v.used && (
                    <span className="shrink-0 rounded-full bg-[#e7e8e9] px-2.5 py-1 text-[10px] font-bold text-[#707974]">
                      Sudah Dipakai
                    </span>
                  )}
                </div>

                {/* Kode + tombol salin */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-dashed border-[#bfc9c3] bg-[#f8f9fa] px-3 py-2 font-mono text-sm font-bold tracking-widest text-[#003527] truncate">
                    {v.code}
                  </div>
                  <button
                    onClick={() => copyCode(v)}
                    disabled={v.used}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      copiedId === v.id
                        ? "bg-[#b0f0d6] text-[#003527]"
                        : "bg-[#003527] text-white hover:bg-[#064e3b]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedId === v.id ? "check" : "content_copy"}
                    </span>
                    {copiedId === v.id ? "Tersalin!" : "Salin"}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#707974]">
                  <span>Berlaku sampai: <b>{formatDate(v.endDate)}</b></span>
                  <span>Sisa kuota: <b>{v.quota - v.usedCount}</b></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
