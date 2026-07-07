"use client";

import Image from "next/image";
import { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";

const vouchers = [
  {
    id: 1,
    type: "Discount",
    value: "$50",
    unit: "OFF",
    bgLeft: "bg-[#064e3b]",
    textLeft: "text-[#80bea6]",
    title: "Summer Solstice Reward",
    badge: { text: "Verified", color: "bg-[#b0f0d6] text-[#002117]" },
    desc: "Applicable on all designer home collections with a minimum purchase of $300.",
    code: "SOLSTICE50",
    expires: "24 Aug 2024",
    expired: false,
  },
  {
    id: 2,
    type: "Flash Sale",
    value: "15%",
    unit: "SAVINGS",
    bgLeft: "bg-[#d9dff5]",
    textLeft: "text-[#5c6274]",
    title: "Tech Bundle Voucher",
    badge: { text: "Exclusive", color: "bg-[#dce2f3] text-[#151c27]" },
    desc: "Get an extra 15% off when you purchase two or more electronics accessories.",
    code: "TECHBUNDLE",
    expires: "02 Sep 2024",
    expired: false,
  },
  {
    id: 3,
    type: "Freebie",
    value: "🚚",
    unit: "SHIPPING",
    bgLeft: "bg-[#abb2c2]/20",
    textLeft: "text-[#003527]",
    title: "Welcome Bonus",
    badge: { text: "Newcomer", color: "bg-[#b0f0d6] text-[#002117]" },
    desc: "Complimentary standard shipping on your next three orders. No minimum spend.",
    code: "FREEDELIVERY",
    expires: "30 Dec 2024",
    expired: false,
  },
  {
    id: 4,
    type: "Expired",
    value: "$10",
    unit: "CASHBACK",
    bgLeft: "bg-[#bfc9c3]",
    textLeft: "text-[#404944]",
    title: "Winter Warmup",
    badge: { text: "Expired", color: "bg-[#707974] text-white" },
    desc: "Cashback reward for winter apparel purchases over $150.",
    code: "WINTER10",
    expires: "15 Mar 2024",
    expired: true,
  },
];

const tabs = ["Active (4)", "Used (12)", "Expired (2)"];

export default function VouchersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
        .premium-cutout {
          mask-image: radial-gradient(circle at 0 50%, transparent 12px, black 13px),
                      radial-gradient(circle at 100% 50%, transparent 12px, black 13px);
          mask-composite: intersect;
          -webkit-mask-image: radial-gradient(circle at 0 50%, transparent 12px, black 12px),
                              radial-gradient(circle at 100% 50%, transparent 12px, black 12px);
        }
      `}</style>

      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0">
        {/* Header */}
        <header className="w-full h-16 sticky top-0 bg-[#f8f9fa] shadow-sm z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <span className="text-[#003527] font-semibold text-xl">Jernih Creatife</span>
            <nav className="hidden md:flex gap-6 text-sm font-semibold">
              <a href="#" className="text-[#404944] hover:text-[#003527] transition-colors">Shop</a>
              <a href="#" className="text-[#404944] hover:text-[#003527] transition-colors">Marketplace</a>
              <a href="#" className="text-[#003527] border-b-2 border-[#003527] pb-1">Dashboard</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-[#edeeef] px-3 py-1.5 rounded-full border border-[#bfc9c3]">
              <span className="material-symbols-outlined text-[#404944] text-lg">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-xs w-44 outline-none ml-1" placeholder="Search vouchers..." type="text" />
            </div>
            <div className="flex gap-2">
              <button className="material-symbols-outlined text-[#003527]">notifications</button>
              <button className="material-symbols-outlined text-[#003527]">shopping_cart</button>
              <button className="material-symbols-outlined text-[#003527]">account_circle</button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-[1280px] mx-auto">
          {/* Page header */}
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-[#003527] font-semibold tracking-tight mb-1" style={{ fontSize: "clamp(32px,5vw,48px)", lineHeight: "1.1" }}>
                My Vouchers
              </h1>
              <p className="text-[#404944] text-base md:text-lg">Unlock exclusive savings and seasonal rewards.</p>
            </div>
            <button className="flex items-center gap-1 px-6 py-3 bg-[#003527] text-white rounded-full text-sm font-semibold hover:bg-[#064e3b] transition-colors active:scale-95 self-start md:self-auto">
              <span className="material-symbols-outlined text-lg">add</span>
              Redeem New
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#bfc9c3] mb-10 gap-8 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`pb-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === i
                    ? "border-[#003527] text-[#003527]"
                    : "border-transparent text-[#404944] hover:text-[#003527]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Voucher grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className={`relative bg-white shadow-md rounded-xl overflow-hidden flex premium-cutout transition-all duration-300 ${
                  v.expired ? "opacity-60 grayscale" : "hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {/* Left color block */}
                <div className={`w-1/3 ${v.bgLeft} ${v.textLeft} p-6 flex flex-col justify-center items-center text-center gap-1 border-r border-dashed border-current/30`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{v.type}</span>
                  <span className="font-bold leading-none" style={{ fontSize: "36px" }}>{v.value}</span>
                  <span className="text-[10px] font-bold uppercase">{v.unit}</span>
                </div>

                {/* Right content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[#003527] font-semibold text-lg leading-tight">{v.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full shrink-0 ml-2 ${v.badge.color}`}>
                        {v.badge.text}
                      </span>
                    </div>
                    <p className="text-[#404944] text-xs leading-relaxed mb-4">{v.desc}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-[#404944] uppercase font-bold opacity-60">Coupon Code</span>
                      <div className="flex items-center gap-1">
                        <code className="font-mono font-bold text-[#003527] tracking-widest text-sm select-all">{v.code}</code>
                        {!v.expired && (
                          <button
                            onClick={() => copyCode(v.id, v.code)}
                            className={`material-symbols-outlined p-1 rounded-full text-lg transition-colors ${
                              copiedId === v.id ? "text-green-600" : "text-[#003527] hover:bg-[#b0f0d6]"
                            }`}
                            aria-label="Copy code"
                          >
                            {copiedId === v.id ? "check" : "content_copy"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-[#404944] uppercase font-bold opacity-60">
                        {v.expired ? "Ended" : "Expires"}
                      </span>
                      <span className="text-sm font-semibold text-[#003527]">{v.expires}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e1e3e4] flex justify-between items-center">
                    <a href="#" className="text-[11px] font-bold text-[#404944] underline hover:text-[#003527] transition-colors">
                      T&amp;C Apply
                    </a>
                    {!v.expired && (
                      <button className="bg-[#282f3b] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-[#3e4552] transition-colors">
                        Shop Now
                      </button>
                    )}
                    {v.expired && (
                      <span className="text-[11px] font-bold text-[#404944]">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo banner */}
          <section className="mt-16 relative rounded-xl overflow-hidden min-h-[280px] flex items-center p-10 md:p-16">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyUdB0ZqIN8mr6Al_hsVMgcIr4SwH8Y6R2E_AWr2rv_T12-UGy9zx0IFgmRvcolA4KkluclRogBcIzvRB_1n0F-sDM2AxyeM1oPG7neygTVmMTUkRB52C2bJnN9_odz0_za46FFA10bWVOb8VXuQTwJGvmKZW_s2niO7h46AfwhNakSxJ5Kga0voNrdlq3Ke8ffvbUqmAlroK6tbrtTmALMj32QwshUUccxtgVYfiS_zukOeTsQ-WR"
                alt="Luxury interior"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#003527]/40 backdrop-blur-[2px]" />
            </div>
            <div className="relative z-10 max-w-xl text-white">
              <h2 className="font-semibold mb-3" style={{ fontSize: "clamp(28px,4vw,48px)", lineHeight: "1.1" }}>
                Exclusive Rewards Waiting
              </h2>
              <p className="text-base md:text-lg mb-10 opacity-90">
                Join our Gold Membership to unlock personalized vouchers, early access to sales, and 2% cashback on every purchase.
              </p>
              <button className="bg-[#b0f0d6] text-[#002117] text-sm font-bold px-16 py-4 rounded-full shadow-lg hover:scale-105 transition-transform">
                Upgrade Account
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
