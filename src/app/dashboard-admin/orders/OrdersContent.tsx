"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";

type OrderItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
  product?: { id: string; name: string; images: string[] } | null;
  service?: { id: string; name: string; images: string[] } | null;
};

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

type Order = {
  id: string;
  orderNumber: string | null;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  subtotal: string;
  discountAmount: string;
  shippingCost: string;
  total: string;
  notes: string | null;
  paymentMethod: string | null;
  paymentProof: string | null;
  paidAt: string | null;
  createdAt: string;
  shippingCourier: string | null;
  trackingNumber: string | null;
  items: OrderItem[];
  address: Address | null;
  user: { id: string; name: string; email: string };
};

const TABS = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai", "Dibatalkan"] as const;

const STATUS_MAP: Record<string, string> = {
  Semua: "",
  "Belum Bayar": "PENDING",
  Dikemas: "CONFIRMED,PROCESSING",
  Dikirim: "SHIPPED",
  Selesai: "DELIVERED",
  Dibatalkan: "CANCELLED,REFUNDED",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Belum Bayar",
  CONFIRMED: "Dikemas",
  PROCESSING: "Dikemas",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dibatalkan",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-[#ffdad6] text-[#93000a]",
  CONFIRMED: "bg-[#064e3b]/10 text-[#064e3b]",
  PROCESSING: "bg-[#d9dff5] text-[#5c6274]",
  SHIPPED: "bg-[#d9dff5] text-[#5c6274]",
  DELIVERED: "bg-[#e7e8e9] text-[#404944]",
  CANCELLED: "bg-[#e7e8e9] text-[#707974]",
  REFUNDED: "bg-[#e7e8e9] text-[#707974]",
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Semua");

  const PAGE_SIZE = 20;

  useEffect(() => {
    let cancelled = false;
    const status = STATUS_MAP[activeTab];
    adminApi<{ data: Order[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `orders?status=${encodeURIComponent(status)}&page=${page}&limit=${PAGE_SIZE}`,
    )
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setOrders(data);
        setTotal(Array.isArray(res) ? data.length : (res?.meta?.total ?? data.length));
        setTotalPages(Array.isArray(res) ? 1 : (res?.meta?.totalPages ?? 1));
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [activeTab, page]);

  // ── Render ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-5 py-4 text-sm font-semibold text-[#93000a]">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-6 border-b border-[#bfc9c3] mb-8" style={{ scrollbarWidth: "none" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); setLoading(true); }}
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

      {/* Orders grid */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="h-16 w-16 text-[#bfc9c3] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-[#707974] text-base">Tidak ada pesanan di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onSelect={() => router.push(`/dashboard-admin/orders/${order.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#e1e3e4]">
          <p className="text-xs text-[#707974]">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} dari {total} pesanan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => { setLoading(true); return Math.max(1, p - 1); })}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#bfc9c3] text-sm font-semibold text-[#404944] disabled:opacity-40 hover:bg-[#f3f4f5]"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-[#404944] font-semibold">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => { setLoading(true); return Math.min(totalPages, p + 1); })}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#bfc9c3] text-sm font-semibold text-[#404944] disabled:opacity-40 hover:bg-[#f3f4f5]"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Order Card ──
function OrderCard({ order, onSelect }: { order: Order; onSelect: () => void }) {
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 hover:shadow-md hover:border-[#064e3b]/30 transition-all cursor-pointer group text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-[#191c1d]">#{displayNumber}</p>
          <p className="text-xs text-[#94a3b8] mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] ?? "bg-[#e7e8e9] text-[#404944]"}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-3 text-sm text-[#475569]">
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="truncate">{order.user.name}</span>
        <span className="text-[#94a3b8]">•</span>
        <span className="truncate text-xs">{order.user.email}</span>
      </div>

      {/* Items preview */}
      <div className="space-y-2 mb-4">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-md bg-[#f1f5f9] overflow-hidden">
              {item.product?.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#94a3b8] text-xs">📦</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#191c1d] truncate">{item.name}</p>
              <p className="text-[11px] text-[#94a3b8]">{item.quantity} x {formatRupiah(item.price)}</p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-[#064e3b] font-semibold">+{order.items.length - 2} item lainnya</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
        <div>
          <p className="text-[11px] text-[#94a3b8]">{itemCount} item</p>
          <p className="text-base font-bold text-[#003527]">{formatRupiah(order.total)}</p>
        </div>
        <span className="text-xs text-[#064e3b] font-semibold group-hover:underline">
          Lihat Detail →
        </span>
      </div>
    </button>
  );
}