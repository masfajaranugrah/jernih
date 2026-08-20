"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
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

type OrderVoucher = {
  id: string;
  voucherCode: string;
  voucherCategory: string;
  discountAmount: string;
  voucher?: {
    code: string;
    name: string | null;
    description: string | null;
    category: string;
    type: string;
    value: string;
  } | null;
};

type Order = {
  id: string;
  orderNumber: string | null;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
  subtotal: string;
  discountAmount: string;
  shippingDiscount: string;
  shippingCost: string;
  total: string;
  notes: string | null;
  paymentMethod: string | null;
  paymentProof: string | null;
  paidAt: string | null;
  createdAt: string;
  shippingCourier: string | null;
  trackingNumber: string | null;
  shippingCourierCode: string | null;
  shippingService: string | null;
  shippingServiceDescription: string | null;
  shippingEtd: string | null;
  midtransTransactionId: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingProvince: string | null;
  shippingCity: string | null;
  shippingDistrict: string | null;
  shippingPostalCode: string | null;
  items: OrderItem[];
  address: Address | null;
  user: { id: string; name: string; email: string; phone: string | null };
  orderVouchers?: OrderVoucher[];
};

const STATUS_META: Record<string, { label: string; desc: string; badge: string }> = {
  PENDING: { label: "Menunggu Pembayaran", desc: "Pembayaran belum diterima", badge: "bg-[#ffdad6] text-[#93000a]" },
  CONFIRMED: { label: "Pembayaran Berhasil", desc: "Pesanan menunggu diproses", badge: "bg-[#064e3b]/10 text-[#064e3b]" },
  PROCESSING: { label: "Sedang Diproses", desc: "Pesanan sedang dikemas", badge: "bg-[#d9dff5] text-[#3d4a77]" },
  SHIPPED: { label: "Dalam Pengiriman", desc: "Pesanan telah dikirim", badge: "bg-[#d9dff5] text-[#3d4a77]" },
  DELIVERED: { label: "Selesai", desc: "Pesanan telah diterima", badge: "bg-[#e7e8e9] text-[#404944]" },
  CANCELLED: { label: "Dibatalkan", desc: "Pesanan dibatalkan", badge: "bg-[#e7e8e9] text-[#707974]" },
  REFUNDED: { label: "Dana Dikembalikan", desc: "Pembayaran telah dikembalikan", badge: "bg-[#e7e8e9] text-[#707974]" },
  EXPIRED: { label: "Kedaluwarsa", desc: "Waktu pembayaran habis", badge: "bg-[#e7e8e9] text-[#707974]" },
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
  PARTIALLY_REFUNDED: "Dikembalikan Sebagian",
  AMOUNT_MISMATCH: "Nominal Tidak Sesuai",
};

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "bg-[#ffdad6] text-[#93000a]",
  PAID: "bg-[#064e3b]/10 text-[#064e3b]",
  FAILED: "bg-[#ffdad6] text-[#93000a]",
  EXPIRED: "bg-[#e7e8e9] text-[#707974]",
  CANCELLED: "bg-[#e7e8e9] text-[#707974]",
  REFUNDED: "bg-[#e7e8e9] text-[#707974]",
  PARTIALLY_REFUNDED: "bg-[#e7e8e9] text-[#707974]",
  AMOUNT_MISMATCH: "bg-[#ffdad6] text-[#93000a]",
};

const METHOD_LABEL: Record<string, string> = {
  bca_va: "BCA Virtual Account",
  bni_va: "BNI Virtual Account",
  bri_va: "BRI Virtual Account",
  mandiri_va: "Mandiri Virtual Account",
  gopay: "GoPay",
  ovo: "OVO",
  shopeepay: "ShopeePay",
  qris: "QRIS",
};

const TERMINAL_STATUS: Record<string, { label: string; desc: string }> = {
  CANCELLED: { label: "Pesanan Dibatalkan", desc: "Pesanan telah dibatalkan" },
  REFUNDED: { label: "Dana Dikembalikan", desc: "Pembayaran telah dikembalikan" },
  EXPIRED: { label: "Pembayaran Kedaluwarsa", desc: "Waktu pembayaran telah habis" },
};

function formatRupiah(value: string | number | undefined | null) {
  const num = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  return "Rp " + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDateTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [courier, setCourier] = useState("");
  const [resi, setResi] = useState("");

  const displayNumber = order?.orderNumber ?? (order ? order.id.slice(0, 8).toUpperCase() : "");

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function load() {
    try {
      const data = await adminApi<Order>(`orders/${encodeURIComponent(id)}`);
      setOrder(data);
      if (data.orderNumber) {
        try {
          const status = await adminApi<{ paymentStatus?: string }>(
            `payments/${encodeURIComponent(data.orderNumber)}/status`,
          );
          setPaymentStatus(status.paymentStatus ?? "PENDING");
        } catch {
          // Endpoint status pembayaran opsional — jangan gagalkan halaman.
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pemuatan data awal
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdateStatus(newStatus: string, shippingData?: { courier: string; resi: string }) {
    if (!order) return;
    setUpdating(newStatus);
    try {
      const body: { status: string; shippingCourier?: string; trackingNumber?: string } = { status: newStatus };
      if (shippingData) {
        body.shippingCourier = shippingData.courier;
        body.trackingNumber = shippingData.resi;
      }
      const updated = await adminApi<Order>(`orders/${encodeURIComponent(order.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setOrder((prev) => (prev ? { ...prev, ...updated } : updated));
      if (updated.orderNumber) {
        try {
          const status = await adminApi<{ paymentStatus?: string }>(
            `payments/${encodeURIComponent(updated.orderNumber)}/status`,
          );
          setPaymentStatus(status.paymentStatus ?? paymentStatus);
        } catch {
          /* abaikan */
        }
      }
      showToast("success", `Status berhasil diubah ke ${STATUS_META[newStatus]?.label ?? newStatus}`);
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Gagal mengubah status");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (error || !order) {
    return (
      <Shell>
        <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffdad6]">
            <svg className="h-7 w-7 text-[#ba1a1a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold text-[#191c1d]">Gagal memuat detail pesanan</h1>
          <p className="mt-1 text-sm text-[#475569]">{error || "Pesanan tidak ditemukan atau tidak dapat diakses."}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                load();
              }}
              className="rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#043b2d]"
            >
              Coba Lagi
            </button>
            <Link
              href="/dashboard-admin/admin/pesanan"
              className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#f8f9fa]"
            >
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const actions = getNextActions(order);
  const paymentLabel = PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus;
  const paymentBadge = PAYMENT_BADGE[paymentStatus] ?? "bg-[#e7e8e9] text-[#707974]";

  return (
    <>
      <Shell>
        {/* Toast */}
        {toast && (
          <div
            role="status"
            className={`fixed top-20 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
              toast.type === "success"
                ? "bg-[#f0fdf4] border border-[#bbf7d0] text-[#064e3b]"
                : "bg-[#fef2f2] border border-[#fecaca] text-[#dc2626]"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* ── Header ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Kembali"
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] transition hover:bg-[#f8f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064e3b]/40"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-[#191c1d] sm:text-2xl">Detail Pesanan</h1>
              <p className="mt-0.5 text-sm font-bold text-[#191c1d]">#{displayNumber}</p>
              <p className="text-xs text-[#707974]">{formatDateTime(order.createdAt) ?? "Tanggal tidak tersedia"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <div className="hidden gap-2 lg:flex">
              <ActionButtons
                actions={actions}
                updating={updating}
                onPrimary={openShippingFormOrUpdate}
                onSecondary={handleUpdateStatus}
              />
            </div>
          </div>
        </div>

        {/* ── Grid konten ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
          {/* Mobile: Ringkasan paling atas */}
          <section className="order-1 lg:col-start-2 lg:row-start-1 lg:order-none">
            <SummaryCard order={order} />
          </section>

          <section className="order-2 lg:col-start-1 lg:row-start-1 lg:order-none">
            <ProductsCard order={order} />
          </section>

          <section className="order-3 lg:col-start-1 lg:row-start-2 lg:order-none">
            <AddressCard order={order} />
          </section>

          <section className="order-4 lg:col-start-1 lg:row-start-3 lg:order-none">
            <ShippingCard order={order} />
          </section>

          <section className="order-5 lg:col-start-2 lg:row-start-2 lg:order-none">
            <PaymentCard
              order={order}
              paymentLabel={paymentLabel}
              paymentBadge={paymentBadge}
            />
          </section>

          <section className="order-6 lg:col-start-2 lg:row-start-3 lg:order-none">
            <VoucherCard order={order} />
          </section>

          <section className="order-7 lg:col-start-1 lg:row-start-4 lg:order-none">
            <TimelineCard order={order} />
          </section>

          <section className="order-8 lg:col-start-2 lg:row-start-4 lg:order-none">
            <CustomerCard order={order} />
          </section>

          {order.notes && (
            <section className="order-9 lg:col-start-1 lg:row-start-5 lg:order-none">
              <NotesCard notes={order.notes} />
            </section>
          )}
        </div>
      </Shell>

      {/* ── Sticky action bar mobile ── */}
      {actions.length > 0 && (
        <div className="lg:hidden fixed left-0 right-0 bottom-[64px] z-40 px-4 pb-3">
          <div className="mx-auto flex max-w-md gap-3 rounded-2xl border border-[#e2e8f0] bg-white/95 p-3 shadow-lg backdrop-blur">
            <ActionButtons
              actions={actions}
              updating={updating}
              onPrimary={openShippingFormOrUpdate}
              onSecondary={handleUpdateStatus}
            />
          </div>
        </div>
      )}

      {/* ── Modal form pengiriman ── */}
      {showShippingForm && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setShowShippingForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Informasi Pengiriman"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#191c1d]">Informasi Pengiriman</h3>
            <p className="mt-1 text-sm text-[#475569]">
              Masukkan nama kurir/ekspedisi dan nomor resi untuk menandai pesanan telah dikirim.
            </p>
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#707974]">Kurir / Ekspedisi</span>
                <input
                  type="text"
                  placeholder="contoh: JNE"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full rounded-xl border border-[#bfc9c3] bg-white px-4 py-2.5 text-sm text-[#191c1d] outline-none transition focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#707974]">Nomor Resi</span>
                <input
                  type="text"
                  placeholder="contoh: JNE123456789"
                  value={resi}
                  onChange={(e) => setResi(e.target.value)}
                  className="w-full rounded-xl border border-[#bfc9c3] bg-white px-4 py-2.5 text-sm text-[#191c1d] outline-none transition focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  if (!courier.trim() || !resi.trim()) return;
                  handleUpdateStatus("SHIPPED", { courier: courier.trim(), resi: resi.trim() });
                  setShowShippingForm(false);
                }}
                disabled={updating === "SHIPPED" || !courier.trim() || !resi.trim()}
                className="flex-1 rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#043b2d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating === "SHIPPED" ? "Memproses..." : "Kirim Pesanan"}
              </button>
              <button
                onClick={() => setShowShippingForm(false)}
                className="rounded-xl border border-[#e2e8f0] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#f8f9fa]"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  function openShippingFormOrUpdate(action: Action) {
    if (action.shipping) {
      setShowShippingForm(true);
      return;
    }
    handleUpdateStatus(action.status);
  }
}

// ── Helpers ──

type Action = { label: string; status: string; tone: "primary" | "danger"; shipping?: boolean };

function getNextActions(order: Order): Action[] {
  switch (order.status) {
    case "PENDING":
      return [
        { label: "Konfirmasi Pembayaran", status: "CONFIRMED", tone: "primary" },
        { label: "Tolak / Batalkan", status: "CANCELLED", tone: "danger" },
      ];
    case "CONFIRMED":
      return [{ label: "Proses Pesanan", status: "PROCESSING", tone: "primary" }];
    case "PROCESSING":
      return [{ label: "Kirim Pesanan", status: "SHIPPED", tone: "primary", shipping: true }];
    case "SHIPPED":
      return [{ label: "Tandai Selesai", status: "DELIVERED", tone: "primary" }];
    default:
      return [];
  }
}

function ActionButtons({
  actions,
  updating,
  onPrimary,
  onSecondary,
}: {
  actions: Action[];
  updating: string | null;
  onPrimary: (a: Action) => void;
  onSecondary: (status: string) => void;
}) {
  return (
    <>
      {actions.map((action) => {
        const isUpdating = updating === action.status;
        const styles =
          action.tone === "danger"
            ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
            : "bg-[#064e3b] hover:bg-[#043b2d] text-white";
        return (
          <button
            key={action.status}
            onClick={() => (action.tone === "primary" ? onPrimary(action) : onSecondary(action.status))}
            disabled={updating !== null}
            className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064e3b]/40 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none ${styles}`}
          >
            {isUpdating ? "Memproses..." : action.label}
          </button>
        );
      })}
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <main className="lg:ml-64 min-h-screen flex flex-col pb-40 lg:pb-12">
        <section className="p-4 sm:p-6 max-w-[1280px] mx-auto w-full space-y-5">{children}</section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, desc: "", badge: "bg-[#e7e8e9] text-[#404944]" };
  return (
    <span className={`inline-flex flex-col items-start gap-0.5 rounded-xl px-3 py-1.5 ${meta.badge}`}>
      <span className="text-xs font-bold leading-tight">{meta.label}</span>
      {meta.desc && <span className="text-[11px] leading-tight opacity-80">{meta.desc}</span>}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-[#191c1d]">{title}</h2>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-[#475569]">{label}</dt>
      <dd className={`text-sm font-medium text-[#191c1d] ${valueClass ?? ""}`}>{value}</dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-[#94a3b8]">{text}</p>;
}

function ItemImage({ item }: { item: OrderItem }) {
  const src = item.product?.images?.[0] ?? item.service?.images?.[0];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f1f5f9] text-lg text-[#94a3b8]">
      📦
    </div>
  );
}

// ── Cards ──

function ProductsCard({ order }: { order: Order }) {
  return (
    <Card title={`Produk Pesanan (${order.items.length})`}>
      {order.items.length === 0 ? (
        <Empty text="Tidak ada item pada pesanan ini." />
      ) : (
        <ul className="divide-y divide-[#eef0f1]">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9]">
                <ItemImage item={item} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#191c1d]">{item.name}</p>
                <p className="text-xs text-[#707974]">
                  {item.quantity} × {formatRupiah(item.price)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[#191c1d]">{formatRupiah(item.subtotal)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SummaryCard({ order }: { order: Order }) {
  return (
    <Card title="Ringkasan Pesanan">
      <dl className="space-y-2.5">
        <Row label="Subtotal Produk" value={formatRupiah(order.subtotal)} />
        {Number(order.discountAmount) > 0 && (
          <Row label="Diskon Produk" value={`-${formatRupiah(order.discountAmount)}`} valueClass="text-[#dc2626]" />
        )}
        {Number(order.shippingDiscount) > 0 && (
          <Row label="Diskon Ongkir" value={`-${formatRupiah(order.shippingDiscount)}`} valueClass="text-[#dc2626]" />
        )}
        {Number(order.shippingCost) > 0 && <Row label="Pengiriman" value={formatRupiah(order.shippingCost)} />}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#e2e8f0] pt-4">
        <span className="text-sm font-semibold text-[#191c1d]">Total Pembayaran</span>
        <span className="text-xl font-bold text-[#064e3b]">{formatRupiah(order.total)}</span>
      </div>
    </Card>
  );
}

function AddressCard({ order }: { order: Order }) {
  const name = order.shippingName ?? order.address?.recipient;
  const phone = order.shippingPhone ?? order.address?.phone;
  const street = order.shippingAddress ?? order.address?.street;
  const district = order.shippingDistrict;
  const city = order.shippingCity ?? order.address?.city;
  const province = order.shippingProvince ?? order.address?.province;
  const postal = order.shippingPostalCode ?? order.address?.postalCode;

  if (!name && !street && !city) {
    return (
      <Card title="Alamat Pengiriman">
        <Empty text="Alamat tidak tersedia" />
      </Card>
    );
  }

  const parts = [street, district, city, province, postal ? `Kode Pos ${postal}` : null].filter(Boolean) as string[];

  return (
    <Card title="Alamat Pengiriman">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-[#191c1d]">{name ?? "Penerima tidak tersedia"}</p>
        {phone && <p className="text-sm text-[#707974]">{phone}</p>}
        {parts.length > 0 && (
          <div className="mt-2 space-y-0.5 text-sm text-[#475569]">
            {parts.map((part) => (
              <p key={part}>{part}</p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function ShippingCard({ order }: { order: Order }) {
  const courier = order.shippingCourier ?? order.shippingCourierCode;
  const service = order.shippingService;
  const description = order.shippingServiceDescription;
  const etd = order.shippingEtd;

  const hasShipping = courier || service || Number(order.shippingCost) > 0;

  if (!hasShipping && !order.trackingNumber) {
    return (
      <Card title="Pengiriman">
        <Empty text="Informasi pengiriman belum tersedia" />
      </Card>
    );
  }

  return (
    <Card title="Pengiriman">
      <dl className="space-y-2.5">
        {courier && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-[#475569]">Kurir</dt>
            <dd className="text-sm font-semibold text-[#191c1d] uppercase">{courier}</dd>
          </div>
        )}
        {service && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-[#475569]">Layanan</dt>
            <dd className="text-right text-sm font-medium text-[#191c1d]">
              {service}
              {description ? <span className="block text-xs text-[#707974]">{description}</span> : null}
            </dd>
          </div>
        )}
        {etd && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-[#475569]">Estimasi</dt>
            <dd className="text-sm font-medium text-[#191c1d]">{etd}</dd>
          </div>
        )}
        {Number(order.shippingCost) > 0 && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-[#475569]">Biaya Pengiriman</dt>
            <dd className="text-sm font-semibold text-[#191c1d]">{formatRupiah(order.shippingCost)}</dd>
          </div>
        )}
        {order.trackingNumber && (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f8f9fa] px-3 py-2">
            <dt className="text-xs text-[#707974]">No. Resi</dt>
            <dd className="text-sm font-bold text-[#064e3b]">{order.trackingNumber}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

function PaymentCard({
  order,
  paymentLabel,
  paymentBadge,
}: {
  order: Order;
  paymentLabel: string;
  paymentBadge: string;
}) {
  const method = METHOD_LABEL[order.paymentMethod ?? ""] ?? order.paymentMethod;
  const paidAt = formatDateTime(order.paidAt);

  return (
    <Card title="Pembayaran">
      <dl className="space-y-2.5">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-[#475569]">Metode Pembayaran</dt>
          <dd className="text-right text-sm font-medium text-[#191c1d]">{method ?? "Belum dipilih"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-[#475569]">Status Pembayaran</dt>
          <dd>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentBadge}`}>{paymentLabel}</span>
          </dd>
        </div>
        {paidAt && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-[#475569]">Waktu Pembayaran</dt>
            <dd className="text-right text-sm font-medium text-[#191c1d]">{paidAt}</dd>
          </div>
        )}
        {order.midtransTransactionId && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-[#475569]">Payment ID</dt>
            <dd className="max-w-[50%] truncate text-sm font-medium text-[#191c1d]" title={order.midtransTransactionId}>
              {order.midtransTransactionId}
            </dd>
          </div>
        )}
      </dl>

      {order.paymentProof && (
        <div className="mt-4 rounded-xl bg-[#f8f9fa] p-3">
          <p className="mb-2 text-xs font-semibold text-[#707974]">Bukti Pembayaran</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.paymentProof}
            alt="Bukti pembayaran"
            className="max-h-40 w-full rounded-lg border border-[#e2e8f0] object-contain"
          />
        </div>
      )}
    </Card>
  );
}

function VoucherCard({ order }: { order: Order }) {
  const vouchers = order.orderVouchers ?? [];
  if (vouchers.length === 0) {
    return (
      <Card title="Voucher">
        <Empty text="Tidak menggunakan voucher" />
      </Card>
    );
  }
  return (
    <Card title="Voucher">
      <ul className="space-y-3">
        {vouchers.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#e2e8f0] bg-[#f8f9fa] px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#064e3b]">{v.voucherCode}</p>
              <p className="text-xs text-[#707974]">
                {v.voucherCategory === "SHIPPING" ? "Potongan Ongkir" : "Diskon Produk"}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-[#dc2626]">-{formatRupiah(v.discountAmount)}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CustomerCard({ order }: { order: Order }) {
  const initial = (order.user.name ?? "?").charAt(0).toUpperCase();
  return (
    <Card title="Customer">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#064e3b] text-base font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#191c1d]">{order.user.name}</p>
          <p className="truncate text-xs text-[#707974]">{order.user.email}</p>
          {order.user.phone && <p className="truncate text-xs text-[#707974]">{order.user.phone}</p>}
        </div>
      </div>
    </Card>
  );
}

function NotesCard({ notes }: { notes: string }) {
  return (
    <Card title="Catatan">
      <p className="whitespace-pre-line text-sm text-[#475569]">{notes}</p>
    </Card>
  );
}

function TimelineCard({ order }: { order: Order }) {
  const steps = [
    { key: "PENDING", label: "Pesanan Dibuat", desc: "Pesanan berhasil dibuat" },
    { key: "CONFIRMED", label: "Pembayaran Berhasil", desc: "Pembayaran telah dikonfirmasi" },
    { key: "PROCESSING", label: "Pesanan Diproses", desc: "Pesanan sedang dikemas" },
    { key: "SHIPPED", label: "Dikirim", desc: order.trackingNumber ? `No. Resi: ${order.trackingNumber}` : "Pesanan dalam perjalanan" },
    { key: "DELIVERED", label: "Selesai", desc: "Pesanan telah diterima" },
  ];

  const linearOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const terminal = TERMINAL_STATUS[order.status];
  const currentIdx = linearOrder.indexOf(order.status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const timestamps: Record<string, string | null> = {
    PENDING: order.createdAt,
    CONFIRMED: order.paidAt ?? null,
  };

  return (
    <Card title="Status Pesanan">
      <div className="relative">
        <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-[#e2e8f0]" />

        {steps.map((step, idx) => {
          const isActive = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          const time = timestamps[step.key];
          return (
            <div key={step.key} className={`relative flex gap-4 ${idx === steps.length - 1 ? "pb-0" : "pb-6"}`}>
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isActive ? "bg-[#064e3b] text-white" : "border-2 border-[#e2e8f0] bg-white"
                } ${isCurrent ? "ring-2 ring-[#064e3b]/30" : ""}`}
                aria-hidden="true"
              >
                {isActive ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#e2e8f0]" />
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className={`text-sm font-semibold ${isActive ? "text-[#191c1d]" : "text-[#94a3b8]"}`}>
                  {step.label}
                  {isCurrent && !terminal && (
                    <span className="ml-2 inline-block rounded-full bg-[#064e3b]/10 px-2 py-0.5 text-[11px] font-bold text-[#064e3b]">
                      Berlangsung
                    </span>
                  )}
                </p>
                <p className={`text-xs ${isActive ? "text-[#475569]" : "text-[#c0c6ca]"}`}>
                  {time ?? step.desc}
                </p>
              </div>
            </div>
          );
        })}

        {terminal && (
          <div className="relative mt-6 flex gap-4 rounded-xl bg-[#fef2f2] px-4 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-white" aria-hidden="true">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#93000a]">{terminal.label}</p>
              <p className="text-xs text-[#93000a]/80">{terminal.desc}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Loading skeleton ──

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#eef0f1] ${className}`} />;
}

function DetailSkeleton() {
  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
        <div className="space-y-5">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </Shell>
  );
}