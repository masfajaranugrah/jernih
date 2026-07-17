"use client";

import { useEffect, useState } from "react";

const tabs = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai"] as const;

type ApiOrderItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
};

type ApiOrder = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  total: string;
  createdAt: string;
  items: ApiOrderItem[];
};

/** Map status backend → label tab bahasa Indonesia */
const statusLabel: Record<ApiOrder["status"], string> = {
  PENDING: "Belum Bayar",
  CONFIRMED: "Dikemas",
  PROCESSING: "Dikemas",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dibatalkan",
};

const statusBadge: Record<string, string> = {
  "Belum Bayar": "bg-[#ffdad6] text-[#93000a]",
  Dikemas: "bg-[#064e3b]/10 text-[#064e3b]",
  Dikirim: "bg-[#d9dff5] text-[#5c6274]",
  Selesai: "bg-[#e7e8e9] text-[#404944]",
  Dibatalkan: "bg-[#e7e8e9] text-[#707974]",
};

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp " + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: ApiOrder }) {
  const label = statusLabel[order.status];

  return (
    <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#bfc9c3] transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5 border-b border-[#e1e3e4] pb-3">
          <div className="min-w-0">
            <span className="text-xs text-[#707974] font-medium block truncate">ID: {order.id}</span>
            <span className="text-[11px] text-[#9ca3af]">{formatDate(order.createdAt)}</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusBadge[label] ?? "bg-[#e7e8e9] text-[#404944]"}`}>
            {label}
          </span>
        </div>
        <div className="space-y-3 mb-5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#edeeef] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#bfc9c3]">inventory_2</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[#191c1d] font-medium text-sm truncate">{item.name}</h4>
                <p className="text-[#707974] text-xs mt-0.5">
                  {item.quantity} x {formatRupiah(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-end pt-3 border-t border-[#e1e3e4]">
        <div>
          <p className="text-xs text-[#707974]">Total Belanja</p>
          <p className="text-[#003527] font-semibold text-xl">{formatRupiah(order.total)}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPelangganPage() {
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Gagal memuat pesanan");
        }
        return res.json();
      })
      .then((data: ApiOrder[]) => {
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered =
    activeTab === "Semua"
      ? orders
      : orders.filter((o) => statusLabel[o.status] === activeTab);

  return (
    <>
      {/* Page heading */}
      <div className="mb-10">
        <h1
          className="text-[#191c1d] font-semibold tracking-tight mb-1"
          style={{ fontSize: "36px", lineHeight: "1.2", letterSpacing: "-0.02em" }}
        >
          Pesanan Saya
        </h1>
        <p className="text-[#707974] text-base">
          Pantau status pesanan dan riwayat belanja Anda.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex overflow-x-auto gap-6 border-b border-[#bfc9c3] mb-8"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? "border-[#003527] text-[#003527]"
                : "border-transparent text-[#707974] hover:text-[#003527]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-[#707974]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
          <span className="text-sm font-medium">Memuat pesanan...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm font-semibold text-[#93000a]">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">
            shopping_bag
          </span>
          <p className="text-[#707974] text-base">
            {activeTab === "Semua"
              ? "Belum ada pesanan. Yuk mulai belanja!"
              : "Tidak ada pesanan di kategori ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}
