"use client";

import { useEffect, useState } from "react";
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [shippingForm, setShippingForm] = useState<{ courier: string; resi: string } | null>(null);

  useEffect(() => {
    adminApi<Order[]>('orders')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleUpdateStatus(
    orderId: string,
    newStatus: string,
    shippingData?: { courier: string; resi: string },
  ) {
    setUpdating(orderId);
    try {
      const body: any = { status: newStatus };
      if (shippingData) {
        body.shippingCourier = shippingData.courier;
        body.trackingNumber = shippingData.resi;
      }
      const updated = await adminApi<Order>(`orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      if (selected?.id === orderId) setSelected((prev) => prev ? { ...prev, ...updated } : null);
      showToast("success", `Status berhasil diubah ke ${STATUS_LABEL[newStatus]}`);
    } catch (e: any) {
      showToast("error", e.message ?? "Gagal update status");
    } finally {
      setUpdating(null);
    }
  }

  // Filter by tab
  const statusFilter = STATUS_MAP[activeTab];
  const filtered = !statusFilter
    ? orders
    : orders.filter((o) => statusFilter.split(",").includes(o.status));

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
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-[#f0fdf4] border border-[#bbf7d0] text-[#064e3b]"
              : "bg-[#fef2f2] border border-[#fecaca] text-[#dc2626]"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-6 border-b border-[#bfc9c3] mb-8" style={{ scrollbarWidth: "none" }}>
        {TABS.map((tab) => (
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
            {tab !== "Semua" && (
              <span className="ml-1.5 text-xs opacity-60">
                ({orders.filter((o) => statusFilter.split(",").includes(o.status)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="h-16 w-16 text-[#bfc9c3] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-[#707974] text-base">Tidak ada pesanan di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onSelect={() => setSelected(order)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          updating={updating}
        />
      )}
    </>
  );
}

// ── Order Card ──
function OrderCard({ order, onSelect }: { order: Order; onSelect: () => void }) {
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 hover:shadow-md hover:border-[#064e3b]/30 transition-all cursor-pointer group"
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
        <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
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
    </div>
  );
}

// ── Order Detail Modal ──
function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  updating,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, shippingData?: { courier: string; resi: string }) => Promise<void>;
  updating: string | null;
}) {
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [courier, setCourier] = useState("");
  const [resi, setResi] = useState("");

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  function handleShip() {
    if (!courier.trim() || !resi.trim()) return;
    onUpdateStatus(order.id, "SHIPPED", { courier: courier.trim(), resi: resi.trim() });
    setShowShippingForm(false);
  }

  const nextStatuses: { label: string; status: string; color: string; action?: () => void }[] = [];
  if (order.status === "PENDING") {
    nextStatuses.push(
      { label: "Konfirmasi Pembayaran", status: "CONFIRMED", color: "bg-[#064e3b] hover:bg-[#043b2d]" },
      { label: "Tolak / Batalkan", status: "CANCELLED", color: "bg-[#dc2626] hover:bg-[#b91c1c]" },
    );
  } else if (order.status === "CONFIRMED") {
    nextStatuses.push(
      { label: "Proses Pesanan", status: "PROCESSING", color: "bg-[#064e3b] hover:bg-[#043b2d]" },
    );
  } else if (order.status === "PROCESSING") {
    nextStatuses.push(
      { label: "Kirim Pesanan", status: "SHIPPED", color: "bg-[#064e3b] hover:bg-[#043b2d]", action: () => setShowShippingForm(true) },
    );
  } else if (order.status === "SHIPPED") {
    nextStatuses.push(
      { label: "Selesaikan", status: "DELIVERED", color: "bg-[#064e3b] hover:bg-[#043b2d]" },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 bg-black/40 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-lg font-bold text-[#191c1d]">#{displayNumber}</h2>
            <p className="text-xs text-[#94a3b8]">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_BADGE[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
            <button onClick={onClose} className="text-[#94a3b8] hover:text-[#191c1d] transition">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Timeline */}
          <OrderTimeline status={order.status} shippingCourier={order.shippingCourier} trackingNumber={order.trackingNumber} />

          {/* Customer */}
          <div className="rounded-xl bg-[#f8f9fa] p-4">
            <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-2">Pelanggan</p>
            <p className="text-sm font-semibold text-[#191c1d]">{order.user.name}</p>
            <p className="text-xs text-[#475569]">{order.user.email}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-3">Item Pesanan ({itemCount})</p>
            <div className="divide-y divide-[#e2e8f0]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9]">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#94a3b8] text-lg">📦</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#191c1d] truncate">{item.name}</p>
                    <p className="text-xs text-[#707974]">{item.quantity} x {formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#191c1d]">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="rounded-xl bg-[#f8f9fa] p-4 space-y-2">
            <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-2">Pembayaran</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-[#475569]">Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
              {Number(order.discountAmount) > 0 && <div className="flex justify-between text-[#dc2626]"><span>Diskon</span><span>-{formatRupiah(order.discountAmount)}</span></div>}
              {Number(order.shippingCost) > 0 && <div className="flex justify-between"><span>Ongkir</span><span>{formatRupiah(order.shippingCost)}</span></div>}
              <div className="flex justify-between font-bold text-[#191c1d] pt-2 border-t border-[#e2e8f0]"><span>Total</span><span>{formatRupiah(order.total)}</span></div>
            </div>
          </div>

          {/* Payment Proof */}
          {order.paymentProof && (
            <div>
              <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-2">Bukti Pembayaran</p>
              <img src={order.paymentProof} alt="Bukti bayar" className="max-h-48 rounded-xl object-contain bg-[#f8f9fa] border border-[#e2e8f0]" />
            </div>
          )}

          {/* Shipping info (jika sudah dikirim) */}
          {(order.shippingCourier || order.trackingNumber) && (
            <div>
              <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-2">Informasi Pengiriman</p>
              <div className="rounded-xl bg-[#f8f9fa] p-4 space-y-1">
                {order.shippingCourier && <p className="text-sm text-[#191c1d]">Kurir: <span className="font-semibold">{order.shippingCourier}</span></p>}
                {order.trackingNumber && <p className="text-sm text-[#191c1d]">No. Resi: <span className="font-semibold">{order.trackingNumber}</span></p>}
              </div>
            </div>
          )}

          {/* Address */}
          {order.address && (
            <div>
              <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-2">Alamat Pengiriman</p>
              <div className="rounded-xl bg-[#f8f9fa] p-4">
                <p className="text-sm font-semibold text-[#191c1d]">{order.address.recipient}</p>
                <p className="text-xs text-[#475569]">{order.address.phone}</p>
                <p className="text-xs text-[#475569] mt-1">{order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-1">Catatan</p>
              <p className="text-sm text-[#475569] bg-[#f8f9fa] p-3 rounded-xl">{order.notes}</p>
            </div>
          )}

          {/* Shipping Form (untuk Kirim Pesanan) */}
          {showShippingForm && (
            <div className="rounded-xl border border-[#e2e8f0] p-4 space-y-3">
              <p className="text-sm font-bold text-[#191c1d]">Informasi Pengiriman</p>
              <input
                type="text"
                placeholder="Nama kurir / ekspedisi (contoh: JNE)"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-full rounded-lg border border-[#bfc9c3] px-4 py-2.5 text-sm outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
              />
              <input
                type="text"
                placeholder="No. Resi"
                value={resi}
                onChange={(e) => setResi(e.target.value)}
                className="w-full rounded-lg border border-[#bfc9c3] px-4 py-2.5 text-sm outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleShip}
                  disabled={updating === order.id || !courier.trim() || !resi.trim()}
                  className="flex-1 bg-[#064e3b] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition hover:bg-[#043b2d] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating === order.id ? "Memproses..." : "Kirim"}
                </button>
                <button
                  onClick={() => setShowShippingForm(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#f1f5f9] rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {nextStatuses.length > 0 && !showShippingForm && (
            <div className="flex flex-wrap gap-3 pt-2">
              {nextStatuses.map((action) => (
                <button
                  key={action.status}
                  onClick={() => action.action ? action.action() : onUpdateStatus(order.id, action.status)}
                  disabled={updating === order.id}
                  className={`text-white text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                >
                  {updating === order.id ? "Memproses..." : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Komponen timeline status pesanan */
function OrderTimeline({ status, shippingCourier, trackingNumber }: { status: string; shippingCourier?: string | null; trackingNumber?: string | null }) {
  const steps = [
    { key: "PENDING", label: "Pesanan Dibuat", icon: "🛒", desc: "Pesanan telah berhasil dibuat" },
    { key: "CONFIRMED", label: "Pembayaran Dikonfirmasi", icon: "✅", desc: "Pembayaran telah diterima" },
    { key: "PROCESSING", label: "Diproses", icon: "⚙️", desc: "Pesanan sedang diproses" },
    { key: "SHIPPED", label: "Dikirim", icon: "🚚", desc: trackingNumber ? `Kurir: ${shippingCourier ?? "-"} • No. Resi: ${trackingNumber}` : "Pesanan dalam perjalanan" },
    { key: "DELIVERED", label: "Selesai", icon: "🎉", desc: "Pesanan telah diterima" },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIdx = statusOrder.indexOf(status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="rounded-xl bg-[#f8f9fa] p-5">
      <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-4">Status Pesanan</p>
      <div className="relative">
        {/* Garis vertikal */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#e2e8f0]" />

        {steps.map((step, idx) => {
          const isActive = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={step.key} className={`relative flex gap-4 pb-5 ${idx === steps.length - 1 ? "pb-0" : ""}`}>
              {/* Circle */}
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                isActive ? "bg-[#064e3b] text-white" : "bg-[#e2e8f0] text-[#94a3b8]"
              } ${isCurrent ? "ring-2 ring-[#064e3b]/30" : ""}`}>
                {isActive ? step.icon : "○"}
              </div>
              {/* Content */}
              <div className="min-w-0 pt-0.5">
                <p className={`text-sm font-semibold ${isActive ? "text-[#191c1d]" : "text-[#94a3b8]"}`}>
                  {step.label}
                  {isCurrent && <span className="ml-2 text-xs text-[#064e3b]">(Saat ini)</span>}
                </p>
                {step.desc && (
                  <p className={`text-xs mt-0.5 ${isActive && step.key === "SHIPPED" ? "text-[#064e3b] font-medium" : "text-[#475569]"}`}>
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
