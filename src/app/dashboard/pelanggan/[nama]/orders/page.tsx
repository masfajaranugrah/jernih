"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

const tabs = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai"] as const;

type ApiOrderItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
  product?: { id: string; name: string; images: string[] } | null;
  service?: { id: string; name: string; images: string[] } | null;
};

type ApiOrder = {
  id: string;
  orderNumber: string | null;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  total: string;
  subtotal: string;
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

function OrderCard({ order, nama }: { order: ApiOrder; nama: string }) {
  const router = useRouter();
  const label = statusLabel[order.status];
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();

  return (
    <div
      onClick={() => router.push(`/dashboard/pelanggan/${nama}/orders/${order.id}`)}
      className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#bfc9c3] hover:shadow-md transition-all cursor-pointer group"
    >
      <div>
        <div className="flex justify-between items-center mb-5 border-b border-[#e1e3e4] pb-3">
          <div className="min-w-0">
            <span className="text-sm font-bold text-[#191c1d]">#{displayNumber}</span>
            <span className="text-xs text-[#475569] block mt-0.5">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[label] ?? "bg-[#e7e8e9] text-[#404944]"}`}>
              {label}
            </span>
            <svg className="h-4 w-4 text-[#94a3b8] group-hover:text-[#003527] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          {order.items.slice(0, 2).map((item) => {
            const imgUrl = item.product?.images?.[0] ?? item.service?.images?.[0] ?? null;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] overflow-hidden shrink-0">
                  {imgUrl ? (
                    <img src={imgUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#94a3b8] text-lg">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[#191c1d] font-medium text-sm truncate">{item.name}</h4>
                  <p className="text-[#475569] text-xs mt-0.5">
                    {item.quantity} x {formatRupiah(item.price)}
                  </p>
                </div>
              </div>
            );
          })}
          {order.items.length > 2 && (
            <p className="text-xs text-[#064e3b] font-semibold">+{order.items.length - 2} item lainnya</p>
          )}
        </div>
      </div>
      <div className="flex justify-between items-end pt-3 border-t border-[#e1e3e4]">
        <div>
          <p className="text-[11px] text-[#475569]">Total Belanja</p>
          <p className="text-[#003527] font-semibold text-xl">{formatRupiah(order.total)}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPelangganPage({
  params,
}: {
  params: Promise<{ nama: string }>;
}) {
  const nama = use(params).nama;
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
            <OrderCard key={order.id} order={order} nama={nama} />
          ))}
        </div>
      )}
    </>
  );
}
