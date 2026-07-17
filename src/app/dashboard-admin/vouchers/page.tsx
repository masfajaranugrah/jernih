"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardSidebar from "../DashboardSidebar";
import {
  getVouchers,
  createVoucher,
  deleteVoucher,
  type ApiVoucher,
  type CreateVoucherInput,
} from "@/lib/voucher-actions";

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp" + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const inputCls =
  "w-full rounded-lg border border-[#bfc9c3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527]";

export default function VouchersAdminPage() {
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [quota, setQuota] = useState("100");
  const [endDate, setEndDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getVouchers();
    setVouchers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setCode(""); setDescription(""); setType("PERCENTAGE");
    setValue(""); setMinPurchase(""); setMaxDiscount(""); setQuota("100"); setEndDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !value) {
      setError("Kode dan nilai voucher wajib diisi.");
      return;
    }

    setSaving(true);
    const payload: CreateVoucherInput = {
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      maxDiscount: type === "PERCENTAGE" && maxDiscount ? Number(maxDiscount) : undefined,
      quota: quota ? Number(quota) : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    };

    const result = await createVoucher(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    resetForm();
    setFormOpen(false);
    load();
  }

  async function handleDelete(id: string, kode: string) {
    if (!confirm(`Hapus voucher ${kode}?`)) return;
    const result = await deleteVoucher(id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    load();
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* Top bar */}
        <header className="w-full h-16 sticky top-0 bg-[#f8f9fa]/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#003527]">confirmation_number</span>
            <h1 className="text-[#003527] font-bold text-lg">Kelola Voucher</h1>
          </div>
          <button
            onClick={() => { setFormOpen((v) => !v); setError(null); }}
            className="flex items-center gap-2 rounded-xl bg-[#064e3b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#043b2d] transition-all"
          >
            <span className="material-symbols-outlined text-base">{formOpen ? "close" : "add"}</span>
            {formOpen ? "Batal" : "Buat Voucher"}
          </button>
        </header>

        <section className="p-6 max-w-5xl">
          {error && (
            <div className="mb-5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#93000a]">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-xs underline">Tutup</button>
            </div>
          )}

          {/* Form buat voucher */}
          {formOpen && (
            <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#707974]">Voucher Baru</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">Kode Voucher *</label>
                  <input
                    type="text" className={inputCls + " uppercase"} placeholder="DISKON10"
                    value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">Deskripsi</label>
                  <input
                    type="text" className={inputCls} placeholder="Diskon 10% semua produk"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">Tipe Potongan *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button" onClick={() => setType("PERCENTAGE")}
                      className={`rounded-lg py-2.5 text-xs font-bold border-2 transition-all ${
                        type === "PERCENTAGE" ? "border-[#064e3b] bg-[#064e3b] text-white" : "border-[#e1e3e4] bg-white text-[#404944]"
                      }`}
                    >
                      Persen (%)
                    </button>
                    <button
                      type="button" onClick={() => setType("FIXED")}
                      className={`rounded-lg py-2.5 text-xs font-bold border-2 transition-all ${
                        type === "FIXED" ? "border-[#064e3b] bg-[#064e3b] text-white" : "border-[#e1e3e4] bg-white text-[#404944]"
                      }`}
                    >
                      Nominal (Rp)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">
                    {type === "PERCENTAGE" ? "Nilai Persen (%) *" : "Nilai Potongan (Rp) *"}
                  </label>
                  <input
                    type="number" min="1" className={inputCls}
                    placeholder={type === "PERCENTAGE" ? "10" : "50000"}
                    value={value} onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">Min. Pembelian (Rp)</label>
                  <input
                    type="number" min="0" className={inputCls} placeholder="0"
                    value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)}
                  />
                </div>
                {type === "PERCENTAGE" && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#404944]">Maks. Potongan (Rp)</label>
                    <input
                      type="number" min="0" className={inputCls} placeholder="Opsional"
                      value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">Kuota Pemakaian</label>
                  <input
                    type="number" min="1" className={inputCls} placeholder="100"
                    value={quota} onChange={(e) => setQuota(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#404944]">Berlaku Sampai</label>
                  <input
                    type="date" className={inputCls}
                    value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit" disabled={saving}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#064e3b] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#043b2d] transition-all disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">save</span>
                {saving ? "Menyimpan..." : "Simpan Voucher"}
              </button>
            </form>
          )}

          {/* Daftar voucher */}
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-[#707974]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
              <span className="text-sm font-medium">Memuat voucher...</span>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">confirmation_number</span>
              <p className="text-[#707974] text-base">Belum ada voucher. Klik &ldquo;Buat Voucher&rdquo; untuk membuat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {vouchers.map((v) => {
                const expired = v.endDate ? new Date(v.endDate) < new Date() : false;
                const quotaFull = v.usedCount >= v.quota;
                const inactive = !v.isActive || expired || quotaFull;
                return (
                  <div
                    key={v.id}
                    className={`flex overflow-hidden rounded-xl border bg-white shadow-sm ${
                      inactive ? "border-[#e1e3e4] opacity-60" : "border-[#064e3b]/20"
                    }`}
                  >
                    {/* Kiri: nilai */}
                    <div className={`flex w-28 shrink-0 flex-col items-center justify-center px-3 py-6 ${inactive ? "bg-[#707974]" : "bg-[#064e3b]"}`}>
                      <span className="text-white font-black text-xl leading-tight text-center">
                        {v.type === "PERCENTAGE" ? `${parseFloat(v.value)}%` : formatRupiah(v.value)}
                      </span>
                      <span className="text-white/70 text-[10px] font-bold uppercase mt-1">OFF</span>
                    </div>
                    {/* Kanan: detail */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-[#003527] text-sm tracking-wider">{v.code}</p>
                          {v.description && (
                            <p className="mt-0.5 text-xs text-[#707974] line-clamp-2">{v.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(v.id, v.code)}
                          className="shrink-0 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-full p-1.5 transition-colors"
                          aria-label={`Hapus ${v.code}`}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#707974]">
                        <span>Min. belanja: <b>{formatRupiah(v.minPurchase)}</b></span>
                        {v.maxDiscount && <span>Maks. potongan: <b>{formatRupiah(v.maxDiscount)}</b></span>}
                        <span>Terpakai: <b>{v.usedCount}/{v.quota}</b></span>
                        <span>Berlaku sampai: <b>{formatDate(v.endDate)}</b></span>
                      </div>
                      <div className="mt-2">
                        {expired ? (
                          <span className="inline-block rounded-full bg-[#e7e8e9] px-2 py-0.5 text-[10px] font-bold text-[#707974]">Kadaluarsa</span>
                        ) : quotaFull ? (
                          <span className="inline-block rounded-full bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold text-[#93000a]">Kuota Habis</span>
                        ) : v.isActive ? (
                          <span className="inline-block rounded-full bg-[#b0f0d6] px-2 py-0.5 text-[10px] font-bold text-[#003527]">Aktif</span>
                        ) : (
                          <span className="inline-block rounded-full bg-[#e7e8e9] px-2 py-0.5 text-[10px] font-bold text-[#707974]">Nonaktif</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
