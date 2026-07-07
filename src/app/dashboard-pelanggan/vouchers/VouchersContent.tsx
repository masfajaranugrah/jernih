"use client";

import { useState } from "react";

type Voucher = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  badge?: { text: string; color: string };
  discount: string;
  expires: string;
  code?: string;
};

const activeVouchers: Voucher[] = [
  {
    id: 1, icon: "local_shipping", title: "Free Shipping",
    desc: "On orders above Rp 500.000",
    badge: { text: "LIMITED", color: "bg-[#dce2f3] text-[#282f3b]" },
    discount: "100% OFF", expires: "12 Okt 2024", code: "SHIPFREE",
  },
  {
    id: 2, icon: "eco", title: "Eco-Friendly Bonus",
    desc: "Sustainability Collection Only",
    badge: { text: "ECO", color: "bg-[#003527] text-white" },
    discount: "Rp 150.000 OFF", expires: "30 Sep 2024",
  },
  {
    id: 3, icon: "cake", title: "Birthday Gift",
    desc: "Special for your month!",
    discount: "20% OFF", expires: "31 Des 2024", code: "BDAYELENA",
  },
  {
    id: 4, icon: "loyalty", title: "New Season",
    desc: "Min. purchase Rp 1.000.000",
    discount: "Rp 200.000 OFF", expires: "15 Nov 2024",
  },
  {
    id: 5, icon: "sell", title: "Flash Sale Extra",
    desc: "Applies on sale items",
    discount: "5% OFF", expires: "24 Jam Lagi", code: "FLASH5",
  },
  {
    id: 6, icon: "credit_card", title: "Card Reward",
    desc: "Linked Card Exclusive",
    discount: "Rp 100.000 OFF", expires: "05 Okt 2024",
  },
];

const tabs = [
  { key: "active", label: "Aktif (12)" },
  { key: "used", label: "Digunakan (45)" },
  { key: "expired", label: "Kadaluarsa" },
];

export default function VouchersContent() {
  const [activeTab, setActiveTab] = useState("active");
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const isGrayscale = activeTab !== "active";

  return (
    <>
      {copied && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#003527] text-white px-6 py-3 rounded-full shadow-2xl font-semibold text-sm z-[100] pointer-events-none">
          Kode <strong>{copied}</strong> berhasil disalin!
        </div>
      )}

      {/* Hero bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="md:col-span-2 relative h-48 rounded-xl overflow-hidden shadow-sm bg-[#064e3b] p-6 flex flex-col justify-between">
          <div>
            <span className="bg-[#003527] px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
              Exclusive Deal
            </span>
            <h3 className="text-[#80bea6] font-semibold text-2xl mt-3 leading-tight">
              Selamat Datang Kembali!
              <br />
              <span className="text-white">Nikmati diskon 25% hari ini.</span>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm px-4 py-2 bg-white text-[#003527] rounded-lg tracking-wider">
              KODE: PREMIUM25
            </span>
            <button className="text-sm text-white underline underline-offset-4">
              Pelajari lebih lanjut
            </button>
          </div>
        </div>
        <div className="bg-[#d9dff5] h-48 rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
          <span className="material-symbols-outlined text-[#003527] text-5xl mb-3"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            confirmation_number
          </span>
          <p className="text-[#003527] font-semibold text-2xl">12 Aktif</p>
          <p className="text-[#5c6274] text-sm mt-1">Voucher tersedia untuk digunakan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#bfc9c3] mb-6 gap-8">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? "border-[#003527] text-[#003527]"
                : "border-transparent text-[#707974] hover:text-[#003527]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Voucher grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${isGrayscale ? "opacity-50 grayscale" : ""}`}>
        {activeVouchers.map((v) => (
          <div key={v.id}
            className="bg-white rounded-xl shadow-sm border border-[#e1e3e4]/50 flex flex-col hover:scale-[1.02] transition-transform duration-300">
            <div className="p-5 flex justify-between items-start border-b border-dashed border-[#bfc9c3]/70 relative">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#064e3b]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#003527]">{v.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#003527] text-sm">{v.title}</h4>
                  <p className="text-xs text-[#707974] mt-0.5">{v.desc}</p>
                </div>
              </div>
              {v.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${v.badge.color}`}>
                  {v.badge.text}
                </span>
              )}
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-full" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-full" />
            </div>
            <div className="p-5 flex-1">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-2xl font-bold text-[#003527]">{v.discount}</span>
                <span className="text-xs text-[#707974]">Exp: {v.expires}</span>
              </div>
              {v.code ? (
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#f3f4f5] border border-dashed border-[#bfc9c3] px-3 py-2 rounded font-mono text-sm tracking-widest text-center">
                    {v.code}
                  </div>
                  <button onClick={() => copyCode(v.code!)}
                    className="bg-[#003527] text-white p-2 rounded-lg hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              ) : (
                <button className="w-full bg-[#003527] text-white font-semibold text-sm py-3 rounded-lg hover:shadow-lg transition-all active:scale-[0.98]">
                  Gunakan Sekarang
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rewards section */}
      <div className="mt-16 bg-[#edeeef] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-[#bfc9c3] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#003527]/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="w-full md:w-1/3 flex-shrink-0">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUvn3RTkKbL2iF0rvb0gyq9vdDy3IQdfQhXcYJSVxCVPEP7iqwUjk04R4f8EvLEr9MOlHm7xMWXbwBn8JSxnfdD8vMM4e0aBirZ3EfzUSK8Q0JMarH3fZJB3qy-3MW99_CyjzdzpS_1ySwxBInc6pRJiO8dJd6mNWDsdZMWSmwUfkqx2ko93p1oTM5UsOwbv1R9icunruGFu_8w5VZsEGiuTsC2zBEoPDoIVXmk6_4BnsoQ_EDS5bQ"
              alt="Rewards" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <span className="text-[#003527] font-bold text-xs uppercase tracking-widest">Rewards Program</span>
          <h3 className="text-[#191c1d] font-semibold text-2xl">Buka Keistimewaan Tier-2</h3>
          <p className="text-[#707974] text-base max-w-lg">
            Kumpulkan poin dari setiap pembelian dan dapatkan voucher eksklusif yang disesuaikan dengan kebiasaan belanja Anda.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-4 py-3 rounded-xl border border-[#e1e3e4] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#003527]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold text-sm">2.450 pts</span>
            </div>
            <button className="bg-[#003527] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#064e3b] transition-all">
              Lihat Riwayat Reward
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#003527] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-50 group"
        aria-label="Tambah kode promo">
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-[#003527] text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          Tambah Kode Promo
        </span>
      </button>
    </>
  );
}
