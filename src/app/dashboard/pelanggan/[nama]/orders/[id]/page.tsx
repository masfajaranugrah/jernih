"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  PAYMENT_METHODS,
  calculateFee,
  loadSnapScript,
  payWithSnap,
  type PaymentMethodId,
} from "@/lib/midtrans";
import { getChatSocket } from "@/lib/chatSocket";
import { getToken } from "@/lib/auth";
import { COURIERS, formatEtd, formatWeightKg, preferNonCargo, type ShippingOption } from "@/lib/shipping";
import OrderHistoryModal, { type OrderHistoryEvent } from "@/components/OrderHistoryModal";

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

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
  subtotal: string;
  discountAmount: string;
  shippingDiscount: string;
  shippingCost: string;
  total: string;
  notes: string | null;
  paymentMethod: string | null;
  paymentProof: string | null;
  snapToken: string | null;
  paymentFee: string | null;
  paidAt: string | null;
  createdAt: string;
  shippingCourier: string | null;
  trackingNumber: string | null;
  addressId: string | null;
  shippingCourierCode: string | null;
  shippingService: string | null;
  shippingServiceDescription: string | null;
  shippingEtd: string | null;
  items: OrderItem[];
  address: Address | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingProvince: string | null;
  shippingCity: string | null;
  shippingDistrict: string | null;
  shippingPostalCode: string | null;
  paymentDeadline: string | null;
  serverTime: string | null;
  shippedAt: string | null;
  receivedProof: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  canConfirmReceived: boolean;
  confirmReceivedAvailableAt: string | null;
  payment: { status: string; method: string | null; label: string | null };
  summary: { subtotal: number; productDiscount: number; shippingCost: number; shippingDiscount: number; grandTotal: number };
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  CONFIRMED: "Pembayaran berhasil",
  PROCESSING: "Pesanan sedang diproses",
  SHIPPED: "Pesanan sedang dikirim",
  DELIVERED: "Pesanan telah diterima",
  CANCELLED: "Pesanan dibatalkan",
  REFUNDED: "Dana telah dikembalikan",
  EXPIRED: "Pesanan dibatalkan",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Pembayaran Berhasil",
  FAILED: "Pembayaran Gagal",
  EXPIRED: "Pembayaran Kadaluarsa",
  CANCELLED: "Pembayaran Dibatalkan",
  REFUNDED: "Dana Telah Dikembalikan",
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

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp " + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDateId(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" });
  return { date, time };
}

/** Countdown berdasarkan paymentDeadline dari backend (bukan jam device customer) */
function useCountdown(deadline?: string | null, serverTime?: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();
    const offset = serverTime ? Date.now() - new Date(serverTime).getTime() : 0;

    const tick = () => {
      setRemaining(Math.max(0, target - (Date.now() - offset)));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline, serverTime]);

  return remaining;
}

function formatCountdown(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0"));
}

// ── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  label: "Menunggu Pembayaran" },
    CONFIRMED:  { bg: "bg-blue-50",   text: "text-blue-700",   label: "Dikonfirmasi" },
    PROCESSING: { bg: "bg-blue-50",   text: "text-blue-700",   label: "Diproses" },
    SHIPPED:    { bg: "bg-indigo-50", text: "text-indigo-700", label: "Dikirim" },
    DELIVERED:  { bg: "bg-green-50",  text: "text-green-700",  label: "Selesai" },
    CANCELLED:  { bg: "bg-red-50",    text: "text-red-700",    label: "Dibatalkan" },
    REFUNDED:   { bg: "bg-slate-50",  text: "text-slate-700",  label: "Dikembalikan" },
    EXPIRED:    { bg: "bg-red-50",    text: "text-red-700",    label: "Kadaluarsa" },
  };
  const cfg = configs[status] ?? { bg: "bg-slate-50", text: "text-slate-700", label: status };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ── Timeline step type ───────────────────────────────────────────────────────
type TimelineStepState = "done" | "active" | "pending";

interface TimelineStep {
  label: string;
  state: TimelineStepState;
  description?: string;
}

// ── Build timeline steps from order status ───────────────────────────────────
function buildTimelineSteps(order: OrderDetail): TimelineStep[] {
  const s = order.status;
  const payStatus = order.payment?.status ?? "PENDING";
  const isCancelled = s === "CANCELLED" || s === "REFUNDED" || s === "EXPIRED";

  if (isCancelled) {
    // Special cancelled indicator — return null to signal cancelled UI
    return [];
  }

  const steps: TimelineStep[] = [
    {
      label: "Pesanan Dibuat",
      state: "done",
      description: formatDateId(order.createdAt).date,
    },
    {
      label: "Pembayaran",
      state: payStatus === "PENDING" || payStatus === "UNPAID" ? (s === "PENDING" ? "active" : "pending") : "done",
      description: payStatus === "PAID"
        ? (order.payment?.label ?? (order.paymentMethod ? METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod : undefined))
        : payStatus === "PENDING" || payStatus === "UNPAID"
        ? "Menunggu pembayaran"
        : undefined,
    },
    {
      label: "Dikemas",
      state: s === "CONFIRMED" || s === "PROCESSING" || s === "SHIPPED" || s === "DELIVERED"
        ? (s === "CONFIRMED" || s === "PROCESSING" ? "active" : "done")
        : "pending",
      description: s === "PROCESSING" ? "Sedang dikemas" : undefined,
    },
    {
      label: "Dikirim",
      state: s === "SHIPPED" ? "active" : s === "DELIVERED" ? "done" : "pending",
      description: s === "SHIPPED" || s === "DELIVERED"
        ? (order.shippingCourier ?? undefined)
        : undefined,
    },
    {
      label: "Selesai",
      state: s === "DELIVERED" ? "done" : "pending",
      description: s === "DELIVERED" && order.receivedAt
        ? formatDateId(order.receivedAt).date
        : undefined,
    },
  ];

  return steps;
}

// ── Visual timeline component ─────────────────────────────────────────────────
function OrderTimeline({ order }: { order: OrderDetail }) {
  const s = order.status;
  const isCancelled = s === "CANCELLED" || s === "REFUNDED" || s === "EXPIRED";

  if (isCancelled) {
    const cancelLabel =
      s === "REFUNDED" ? "Dana Dikembalikan" :
      s === "EXPIRED"  ? "Pesanan Kadaluarsa" :
      "Pesanan Dibatalkan";
    const cancelDesc =
      s === "REFUNDED" ? "Dana telah dikembalikan ke metode pembayaran Anda." :
      s === "EXPIRED"  ? "Batas waktu pembayaran telah habis." :
      "Pesanan telah dibatalkan.";

    return (
      <div className="flex items-start gap-4">
        {/* Cancelled icon */}
        <div className="flex flex-col items-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-4 w-4 fill-red-600" viewBox="0 0 24 24">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
        </div>
        <div className="pt-1.5">
          <p className="text-sm font-bold text-red-600">{cancelLabel}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">{cancelDesc}</p>
        </div>
      </div>
    );
  }

  const steps = buildTimelineSteps(order);

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.label} className="flex items-stretch gap-3">
            {/* Left: circle + connector */}
            <div className="flex w-9 shrink-0 flex-col items-center">
              {/* Circle */}
              {step.state === "done" ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 shadow-sm">
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              ) : step.state === "active" ? (
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] shadow-sm">
                  {/* Pulse ring */}
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#2563EB] opacity-30" />
                  <span className="relative h-3 w-3 rounded-full bg-white" />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#E2E8F0] bg-[#F8FAFC]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#CBD5E1]" />
                </div>
              )}
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`mt-1 w-0.5 flex-1 rounded-full ${
                    step.state === "done" ? "bg-green-400" : "bg-[#E2E8F0]"
                  }`}
                  style={{ minHeight: "1.5rem" }}
                />
              )}
            </div>

            {/* Right: text */}
            <div className={`min-w-0 flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`pt-1.5 text-sm font-semibold leading-tight ${
                  step.state === "done"
                    ? "text-[#0F172A]"
                    : step.state === "active"
                    ? "text-[#2563EB]"
                    : "text-[#94A3B8]"
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-[#64748B]">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ nama: string; id: string }>;
}) {
  const { nama, id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [showPayPanel, setShowPayPanel] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingTotalWeightKg, setShippingTotalWeightKg] = useState<number | null>(null);

  // ── Realtime order:status ─────────────────────────────────────────────────
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);
  const [statusFlash, setStatusFlash] = useState(false);

  // ── Riwayat pesanan modal ────────────────────────────────────────────────
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // ── Konfirmasi pesanan diterima ─────────────────────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmProof, setConfirmProof] = useState("");
  const [confirmProofFile, setConfirmProofFile] = useState<File | null>(null);
  const [confirmReviews, setConfirmReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  async function handleConfirmProofFile(raw: File) {
    if (!raw.type.startsWith("image/")) {
      setConfirmError("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (raw.size > 5 * 1024 * 1024) {
      setConfirmError("Ukuran maksimal 5MB");
      return;
    }
    if (confirmProof.startsWith("blob:")) URL.revokeObjectURL(confirmProof);
    setConfirmProofFile(raw);
    setConfirmProof(URL.createObjectURL(raw));
    setConfirmError("");
  }

  async function handleConfirmReceived() {
    if (!order) return;
    if (!confirmProof) {
      setConfirmError("Bukti penerimaan wajib diupload");
      return;
    }
    const productItems = (order.items ?? []).filter((item) => item.product?.id);
    for (const item of productItems) {
      if (!confirmReviews[item.id]?.rating) {
        setConfirmError(`Rating untuk ${item.name} wajib diisi`);
        return;
      }
    }

    setConfirming(true);
    setConfirmError("");
    try {
      let proofUrl = confirmProof;
      if (confirmProofFile) {
        const formData = new FormData();
        formData.append("files", confirmProofFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: formData });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.message ?? "Gagal upload bukti");
        proofUrl = upData.urls?.[0];
        if (!proofUrl) throw new Error("Tidak mendapatkan URL bukti");
        if (confirmProof.startsWith("blob:")) URL.revokeObjectURL(confirmProof);
      }

      const res = await fetch(`/api/orders/${order.id}/confirm-received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivedProof: proofUrl,
          reviews: productItems.map((item) => ({
            orderItemId: item.id,
            rating: confirmReviews[item.id]?.rating ?? 0,
            comment: confirmReviews[item.id]?.comment ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal konfirmasi penerimaan");
      }
      setShowConfirmModal(false);
      setSuccessMsg("Terima kasih! Pesanan Anda telah diterima. Rating dan ulasan berhasil dikirim.");
      await refreshOrder();
    } catch (e) {
      setConfirmError(e instanceof Error ? e.message : "Terjadi kesalahan saat konfirmasi");
    } finally {
      setConfirming(false);
    }
  }

  /** Muat ulang detail order dari server */
  async function refreshOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setOrder(data);
    } catch {
      /* abaikan — polling berikutnya yang menangani */
    }
  }

  /** Recovery: cek status pembayaran via endpoint status lalu muat ulang order */
  async function syncPaymentStatus() {
    if (!order?.orderNumber) return;
    try {
      await fetch(`/api/payments/${order.orderNumber}/status`, { cache: "no-store" });
    } catch {
      /* abaikan */
    }
    await refreshOrder();
  }

  useEffect(() => {
    refreshOrder().finally(() => setLoading(false));
  }, [id]);

  // Saat halaman dibuka & order masih PENDING, lakukan satu kali recovery
  useEffect(() => {
    if (order?.status === "PENDING") {
      syncPaymentStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status]);

  // Saat order dimuat, inisialisasi metode bayar dari yang tersimpan
  useEffect(() => {
    if (order?.paymentMethod && !selectedMethod) {
      const m = PAYMENT_METHODS.find((x) => x.id === order.paymentMethod);
      if (m) setSelectedMethod(m.id);
    }
  }, [order?.paymentMethod]);

  // Muat opsi ongkir utk order PENDING yang punya alamat
  useEffect(() => {
    if (order?.status !== "PENDING" || !order.address?.id) return;
    let cancelled = false;
    setShippingLoading(true);
    setShippingError("");
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingTotalWeightKg(null);

    fetch("/api/shipping/cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId: order.address.id }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(
            Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal memuat ongkir",
          );
        }
        return data;
      })
      .then((data) => {
        if (cancelled || !data) return;
        const options: ShippingOption[] = Array.isArray(data.options) ? data.options : [];
        setShippingOptions(options);
        setShippingTotalWeightKg(Number(data.totalWeightKg) || null);
        const saved =
          order.shippingCourierCode && order.shippingService
            ? options.find(
                (o) => o.code === order.shippingCourierCode && o.service === order.shippingService,
              )
            : undefined;
        setSelectedShipping(saved ?? preferNonCargo(options));
      })
      .catch((e: unknown) => {
        if (!cancelled) setShippingError(e instanceof Error ? e.message : "Gagal memuat ongkir.");
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });

    return () => { cancelled = true; };
  }, [order?.status, order?.address?.id]);

  // Auto-refresh saat status masih PENDING — halaman langsung berubah begitu bayar
  useEffect(() => {
    if (order?.status !== "PENDING") return;
    const timer = setInterval(refreshOrder, 5000);
    return () => clearInterval(timer);
  }, [order?.status, id]);

  // Realtime via socket — server memberi tahu saat status order berubah
  useEffect(() => {
    const socket = getChatSocket(getToken() ?? undefined);
    const onStatus = (payload: { orderId?: string; status?: string; statusLabel?: string }) => {
      if (payload?.orderId !== id) return;
      // Update state order secara optimistis (tanpa fetch ulang) untuk respon instan
      if (payload.status) {
        setOrder((prev) => prev ? { ...prev, status: payload.status as OrderDetail["status"] } : prev);
      }
      // Animasi highlight singkat pada section status
      setStatusFlash(true);
      setTimeout(() => setStatusFlash(false), 1200);
      // Toast notifikasi kecil
      const label = payload.statusLabel ?? ORDER_STATUS_LABEL[payload.status ?? ""] ?? payload.status ?? "diperbarui";
      setRealtimeToast(`Status pesanan: ${label}`);
      setTimeout(() => setRealtimeToast(null), 4000);
      // Fetch lengkap dari DB (source of truth) untuk data terbaru
      refreshOrder();
      if (payload.status === "CONFIRMED") {
        setSuccessMsg("Pembayaran berhasil dikonfirmasi! Pesanan Anda sedang dikemas.");
      }
    };
    socket.on("order:status", onStatus);
    return () => {
      socket.off("order:status", onStatus);
    };
  }, [id]);

  // Countdown berdasarkan paymentDeadline backend (sumber kebenaran jam server)
  const paymentStatusEarly = order?.payment?.status ?? "PENDING";
  const showCountdownEarly =
    (paymentStatusEarly === "PENDING" || paymentStatusEarly === "UNPAID") &&
    order?.status === "PENDING" &&
    !!order?.paymentDeadline;
  const remaining = useCountdown(showCountdownEarly ? order?.paymentDeadline : null, order?.serverTime);

  // Saat countdown habis, muat ulang status order (backend yang membatalkan)
  useEffect(() => {
    if (showCountdownEarly && remaining === 0) {
      refreshOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, showCountdownEarly]);

  /** Buat/refresh payment-intent Midtrans utk metode terpilih, lalu buka Snap */
  async function handlePay() {
    if (!selectedMethod || !order) return;
    if (order.addressId && !selectedShipping) return;
    setPayError("");
    setPaying(true);
    try {
      if (order.addressId && selectedShipping) {
        const shipRes = await fetch(`/api/orders/${id}/shipping`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressId: order.addressId,
            courier: selectedShipping.code,
            service: selectedShipping.service,
          }),
        });
        if (shipRes.status === 401) {
          router.push("/dashboard/pelanggan/login?from=/keranjang");
          return;
        }
        const shipData = await shipRes.json();
        if (!shipRes.ok) {
          throw new Error(
            Array.isArray(shipData.message) ? shipData.message.join(", ") : shipData.message ?? "Gagal menyimpan pengiriman",
          );
        }
        setOrder((prev) => (prev ? { ...prev, ...shipData } : shipData));
      }

      const res = await fetch(`/api/orders/${id}/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: selectedMethod }),
      });
      if (res.status === 401) {
        router.push("/dashboard/pelanggan/login?from=/keranjang");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal membuat pembayaran",
        );
      }

      await loadSnapScript();
      const resultUrl = `/payment/success?order_id=${encodeURIComponent(order.orderNumber ?? order.id)}`;
      payWithSnap(data.token, {
        onSuccess: () => router.push(resultUrl),
        onPending: () => router.push(resultUrl),
        onError: () => setPayError("Pembayaran gagal atau dibatalkan. Silakan coba lagi."),
      });
      setPaying(false);
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : "Terjadi kesalahan saat memproses pembayaran");
      setPaying(false);
    }
  }

  /** Buka chat: kirim pesan dari pelanggan + bot message dari admin */
  async function handleChatAdmin(e: React.MouseEvent) {
    e.preventDefault();
    if (!order) return;

    const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
    const itemList = (order.items ?? []).map((i) => `• ${i.name} x${i.quantity} = ${formatRupiah(i.subtotal)}`).join("\n");

    try {
      let adminId = "";
      try {
        const adminRes = await fetch("/api/chat/admin-id");
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          adminId = adminData.id;
        }
      } catch { /* fallback */ }

      let customerMsg = `Halo admin, saya ingin konfirmasi pesanan ${orderNumber}:\n\n${itemList}\n\nTotal: ${formatRupiah(order.total)}`;

      if (order.paymentProof) {
        customerMsg += `\n\nBukti pembayaran:\n${order.paymentProof}`;
      }

      if (adminId) {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: customerMsg, receiverId: adminId }),
        });
      }

      await fetch(`/api/orders/${order.id}/bot-message`, { method: "POST" });
    } catch {
      // Abaikan error — tidak kritikal
    }

    router.push(`/dashboard/pelanggan/${nama}/chat`);
  }

  async function copyOrderNumber() {
    const num = order?.orderNumber ?? order?.id ?? "";
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* abaikan */
    }
  }

  /**
   * Bangun array timeline riwayat pesanan secara dinamis dari data order.
   */
  function buildOrderHistory(o: OrderDetail): OrderHistoryEvent[] {
    type RawEvent = OrderHistoryEvent & { _order: number };
    const raw: RawEvent[] = [];

    const payStatus = o.payment?.status ?? "PENDING";
    const methodLbl =
      o.payment?.label ??
      (o.paymentMethod ? (METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod) : null);

    const currentStatus = o.status;

    function push(
      event: { ts?: string | null; title: string; description: string; isCurrent?: boolean },
      order: number,
    ) {
      raw.push({
        timestamp: event.ts ?? o.createdAt,
        title: event.title,
        description: event.description,
        isCurrent: event.isCurrent ?? false,
        _order: order,
      });
    }

    push(
      {
        ts: o.createdAt,
        title: "Pesanan dibuat",
        description: "Pesanan berhasil dibuat",
        isCurrent: currentStatus === "PENDING" && payStatus !== "PAID",
      },
      1,
    );

    if (payStatus === "PAID" || o.paidAt) {
      push(
        {
          ts: o.paidAt ?? o.createdAt,
          title: "Pembayaran berhasil",
          description: methodLbl
            ? `Pembayaran melalui ${methodLbl} telah dikonfirmasi`
            : "Pembayaran telah dikonfirmasi",
          isCurrent: currentStatus === "CONFIRMED",
        },
        2,
      );
    } else if (payStatus === "FAILED") {
      push(
        {
          ts: o.paidAt ?? o.createdAt,
          title: "Pembayaran gagal",
          description: "Pembayaran tidak dapat diproses",
          isCurrent: true,
        },
        2,
      );
    } else if (payStatus === "EXPIRED" || currentStatus === "EXPIRED") {
      push(
        {
          ts: o.paidAt ?? o.createdAt,
          title: "Pembayaran kadaluarsa",
          description: "Batas waktu pembayaran telah habis",
          isCurrent: true,
        },
        2,
      );
    }

    if (
      currentStatus === "PROCESSING" ||
      currentStatus === "SHIPPED" ||
      currentStatus === "DELIVERED"
    ) {
      const processedTs = o.paidAt
        ? new Date(new Date(o.paidAt).getTime() + 1000).toISOString()
        : o.createdAt;
      push(
        {
          ts: processedTs,
          title: "Pesanan diproses",
          description: "Pesanan sedang dipersiapkan",
          isCurrent: currentStatus === "PROCESSING",
        },
        3,
      );
    }

    if (currentStatus === "SHIPPED" || currentStatus === "DELIVERED") {
      const shippedTs =
        o.shippedAt ??
        (o.paidAt
          ? new Date(new Date(o.paidAt).getTime() + 2000).toISOString()
          : o.createdAt);
      const courierDesc = o.shippingCourier
        ? `Pesanan sedang dalam perjalanan via ${o.shippingCourier}${o.trackingNumber ? ` (No. Resi: ${o.trackingNumber})` : ""}`
        : "Pesanan sedang dalam perjalanan";
      push(
        {
          ts: shippedTs,
          title: "Pesanan sedang dikirim",
          description: courierDesc,
          isCurrent: currentStatus === "SHIPPED",
        },
        4,
      );
    }

    if (currentStatus === "DELIVERED") {
      push(
        {
          ts: o.receivedAt ?? o.completedAt ?? o.createdAt,
          title: "Pesanan diterima",
          description: "Pesanan telah diterima oleh pelanggan",
          isCurrent: true,
        },
        5,
      );
    }

    if (currentStatus === "CANCELLED") {
      push(
        {
          ts: o.createdAt,
          title: "Pesanan dibatalkan",
          description: "Pesanan telah dibatalkan",
          isCurrent: true,
        },
        5,
      );
    }

    if (currentStatus === "REFUNDED") {
      push(
        {
          ts: o.completedAt ?? o.createdAt,
          title: "Dana dikembalikan",
          description: "Dana telah dikembalikan ke metode pembayaran Anda",
          isCurrent: true,
        },
        5,
      );
    }

    raw.sort((a, b) => {
      if (b._order !== a._order) return b._order - a._order;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return raw.map(({ _order: _o, ...rest }) => rest);
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[880px] space-y-4 px-4 pb-8 pt-2 sm:px-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-48 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!order) return null;

  // ── Derived state ────────────────────────────────────────────────────────
  const paymentStatus = order.payment?.status ?? "PENDING";
  const isUnpaid = paymentStatus === "PENDING" || paymentStatus === "UNPAID";
  const isPaid = paymentStatus === "PAID";
  const isExpired = paymentStatus === "EXPIRED" || order.status === "EXPIRED";
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const showCountdown = isUnpaid && order.status === "PENDING" && !!order.paymentDeadline;
  const canStillPay = isUnpaid && order.status === "PENDING";

  const methodLabel =
    order.payment?.label ??
    (order.paymentMethod ? METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod : null);

  const displayShipping = selectedShipping
    ? Number(selectedShipping.cost) || 0
    : Number(order.shippingCost) || 0;
  const displayTotal = order.address
    ? Math.max(0, Number(order.subtotal) - Number(order.discountAmount) + displayShipping - Number(order.shippingDiscount || 0))
    : Number(order.total) || 0;
  const selectedFee = selectedMethod ? calculateFee(selectedMethod, displayTotal) : 0;
  const amountToPay = displayTotal + selectedFee;
  const shippingRequired = !!order.addressId;
  const canPay =
    !!selectedMethod && !paying && (!shippingRequired || (!!selectedShipping && !shippingLoading));

  const bankMethods = PAYMENT_METHODS.filter((m) => m.group === "Bank Transfer");
  const walletMethods = PAYMENT_METHODS.filter((m) => m.group === "E-Wallet / QRIS");

  const addrName = order.shippingName ?? order.address?.recipient ?? "";
  const addrPhone = order.shippingPhone ?? order.address?.phone ?? "";
  const addrStreet = order.shippingAddress ?? order.address?.street ?? "";
  const addrCity = [order.shippingDistrict, order.shippingCity].filter(Boolean).join(", ") || order.address?.city || "";
  const addrProvince = order.shippingProvince ?? order.address?.province ?? "";
  const addrPostal = order.shippingPostalCode ?? order.address?.postalCode ?? "";

  const created = formatDateId(order.createdAt);

  const productItemsForReview = (order.items ?? []).filter((item) => item.product?.id);
  const allRated = productItemsForReview.every((item) => (confirmReviews[item.id]?.rating ?? 0) >= 1);

  return (
    <>
      {/* ── Realtime toast ───────────────────────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={[
          "pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-4",
          "transition-all duration-300",
          realtimeToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5 rounded-full bg-[#0F172A] px-5 py-3 shadow-lg">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg className="h-3 w-3 fill-white" viewBox="0 0 24 24">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </span>
          <p className="whitespace-nowrap text-sm font-semibold text-white">{realtimeToast}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[880px] min-w-0 space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:space-y-5">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/pelanggan/${nama}/orders`)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition hover:bg-[#F1F5F9]"
            aria-label="Kembali"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F172A] sm:text-xl">Detail Pesanan</h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="truncate text-xs text-[#64748B]">#{order.orderNumber}</p>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-1 rounded px-1 py-0.5 text-[11px] font-medium text-[#2563EB] transition hover:bg-[#EFF6FF]"
              >
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
                {copied ? "Disalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>

        {/* ── SUCCESS MESSAGE ──────────────────────────────────────────────── */}
        {successMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 sm:px-5">
            <svg className="mt-0.5 h-4 w-4 shrink-0 fill-green-600" viewBox="0 0 24 24">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── STATUS TIMELINE CARD ─────────────────────────────────────────── */}
        <section
          className={[
            "w-full max-w-full rounded-xl border bg-white px-5 py-5 shadow-sm transition-colors duration-700",
            statusFlash ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0]",
          ].join(" ")}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A]">Status Pesanan</h2>
            {(isPaid || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#2563EB] transition hover:bg-[#EFF6FF]"
              >
                Riwayat
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            )}
          </div>

          <OrderTimeline order={order} />

          {/* ── Payment countdown (PENDING) ────────────────────────────────── */}
          {showCountdown && remaining !== null && (
            <div className="mt-4 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">Selesaikan pembayaran dalam</p>
              <p className="mt-1 whitespace-nowrap font-mono text-2xl font-bold tabular-nums tracking-tight text-amber-900">
                {formatCountdown(remaining)[0]}
                <span className="mx-0.5 text-amber-400">:</span>
                {formatCountdown(remaining)[1]}
                <span className="mx-0.5 text-amber-400">:</span>
                {formatCountdown(remaining)[2]}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-amber-700">
                Pesanan akan dibatalkan otomatis jika pembayaran tidak diterima dalam 24 jam.
              </p>
            </div>
          )}

          {/* ── Pay Now button for PENDING ──────────────────────────────────── */}
          {canStillPay && (
            <div className="mt-4 border-t border-[#E2E8F0] pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-[#64748B]">
                    {methodLabel ? `Bayar melalui ${methodLabel}` : "Pilih metode pembayaran"}
                  </p>
                </div>
                <button
                  onClick={() => setShowPayPanel((v) => !v)}
                  className="w-full shrink-0 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8] sm:w-auto"
                >
                  {showPayPanel ? "Tutup" : "Bayar Sekarang"}
                </button>
              </div>

              {/* ── Pay panel ──────────────────────────────────────────────── */}
              {showPayPanel && (
                <div className="mt-4 space-y-4">
                  {/* Shipping options */}
                  {order.address && (
                    <div>
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Pengiriman</p>
                        {shippingTotalWeightKg != null && (
                          <p className="text-xs text-[#64748B]">
                            Berat: <span className="font-bold text-[#0F172A]">{formatWeightKg(shippingTotalWeightKg)}</span>
                          </p>
                        )}
                      </div>
                      {shippingLoading ? (
                        <p className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
                          Menghitung biaya pengiriman...
                        </p>
                      ) : shippingError ? (
                        <p className="text-xs font-semibold text-[#EF4444]">{shippingError}</p>
                      ) : shippingOptions.length === 0 ? (
                        <p className="text-xs text-[#64748B]">Tidak ada layanan pengiriman tersedia untuk alamat ini.</p>
                      ) : (
                        <ShippingOptionList
                          options={shippingOptions}
                          selected={selectedShipping}
                          onSelect={setSelectedShipping}
                        />
                      )}
                    </div>
                  )}

                  {/* Payment method selection */}
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Metode Pembayaran</p>
                    <div className="space-y-2">
                      {bankMethods.map((m) => (
                        <PaymentOption key={m.id} label={m.label} desc={m.desc} active={selectedMethod === m.id} onClick={() => setSelectedMethod(m.id)} />
                      ))}
                    </div>
                    <div className="mt-2 space-y-2">
                      {walletMethods.map((m) => (
                        <PaymentOption key={m.id} label={m.label} desc={m.desc} active={selectedMethod === m.id} onClick={() => setSelectedMethod(m.id)} />
                      ))}
                    </div>
                  </div>

                  {payError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-[#EF4444]">{payError}</p>
                  )}

                  {/* Cost summary */}
                  {selectedMethod && (
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm">
                      <div className="flex min-w-0 justify-between gap-3 text-[#64748B]">
                        <span>Total Pesanan</span>
                        <span className="text-right">{formatRupiah(displayTotal)}</span>
                      </div>
                      {selectedFee > 0 && (
                        <div className="mt-1 flex min-w-0 justify-between gap-3 text-[#64748B]">
                          <span>Biaya Admin</span>
                          <span className="text-right">{formatRupiah(selectedFee)}</span>
                        </div>
                      )}
                      <div className="mt-2 flex min-w-0 justify-between gap-3 border-t border-[#E2E8F0] pt-2 font-bold text-[#0F172A]">
                        <span>Total Bayar</span>
                        <span className="text-right">{formatRupiah(amountToPay)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePay}
                    disabled={!canPay}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paying ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Memproses...
                      </>
                    ) : selectedMethod ? (
                      "Bayar Sekarang"
                    ) : (
                      "Pilih Metode Pembayaran"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Expired / Cancelled notice ──────────────────────────────────── */}
          {(isExpired || (isCancelled && !canStillPay)) && (
            <div className="mt-4 border-t border-[#E2E8F0] pt-4">
              <p className="text-xs text-[#64748B]">
                {order.status === "REFUNDED"
                  ? "Dana telah dikembalikan ke metode pembayaran Anda."
                  : "Pesanan dibatalkan otomatis karena pembayaran tidak dilakukan dalam batas waktu."}
              </p>
            </div>
          )}
        </section>

        {/* ── CONFIRM RECEIVED CARD (SHIPPED) ─────────────────────────────── */}
        {order.status === "SHIPPED" && (
          <section className="w-full max-w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] bg-[#EFF6FF] px-5 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 fill-[#2563EB]" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                <h2 className="text-sm font-bold text-[#2563EB]">Pesanan Sedang Dikirim</h2>
              </div>
            </div>
            <div className="px-5 py-4">
              {order.canConfirmReceived ? (
                <>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    Pastikan Anda telah menerima barang dengan baik. Konfirmasi penerimaan akan mengakhiri pesanan dan
                    memungkinkan Anda memberikan rating serta ulasan untuk produk yang dibeli.
                  </p>
                  <button
                    onClick={() => {
                      if (confirmProof.startsWith("blob:")) URL.revokeObjectURL(confirmProof);
                      setConfirmProof("");
                      setConfirmProofFile(null);
                      setConfirmReviews({});
                      setConfirmError("");
                      setShowConfirmModal(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#15803D]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Pesanan Diterima
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    Pesanan Anda sedang dalam perjalanan. Anda dapat mengkonfirmasi pesanan diterima setelah{" "}
                    <span className="font-semibold text-[#0F172A]">
                      {order.confirmReceivedAvailableAt
                        ? new Date(order.confirmReceivedAvailableAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Jakarta",
                          })
                        : "-"}
                    </span>{" "}
                    WIB.
                  </p>
                  <button
                    onClick={() => {
                      if (confirmProof.startsWith("blob:")) URL.revokeObjectURL(confirmProof);
                      setConfirmProof("");
                      setConfirmProofFile(null);
                      setConfirmReviews({});
                      setConfirmError("");
                      setShowConfirmModal(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#15803D]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Pesanan Diterima
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── INFORMASI PESANAN CARD ───────────────────────────────────────── */}
        <section className="w-full max-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-3.5">
            <h2 className="text-sm font-bold text-[#0F172A]">Informasi Pesanan</h2>
          </div>
          <div className="divide-y divide-[#F1F5F9] px-5">
            {/* Order ID */}
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs text-[#64748B]">Nomor Pesanan</span>
              <span className="text-right text-xs font-semibold text-[#0F172A]">#{order.orderNumber}</span>
            </div>
            {/* Date */}
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs text-[#64748B]">Tanggal Pesanan</span>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#0F172A]">{created.date}</p>
                <p className="text-[11px] text-[#64748B]">{created.time} WIB</p>
              </div>
            </div>
            {/* Status */}
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs text-[#64748B]">Status Pesanan</span>
              <StatusBadge status={order.status} />
            </div>
            {/* Payment status */}
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs text-[#64748B]">Status Pembayaran</span>
              <span
                className={`text-right text-xs font-semibold ${
                  paymentStatus === "PAID"
                    ? "text-[#16A34A]"
                    : paymentStatus === "FAILED" || paymentStatus === "EXPIRED" || paymentStatus === "CANCELLED"
                    ? "text-[#EF4444]"
                    : "text-[#F59E0B]"
                }`}
              >
                {PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}
              </span>
            </div>
            {/* Payment method */}
            {methodLabel && (
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-xs text-[#64748B]">Metode Bayar</span>
                <span className="text-right text-xs font-semibold text-[#0F172A]">{methodLabel}</span>
              </div>
            )}
            {/* Paid at */}
            {order.paidAt && (
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-xs text-[#64748B]">Waktu Pembayaran</span>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#0F172A]">{formatDateId(order.paidAt).date}</p>
                  <p className="text-[11px] text-[#64748B]">{formatDateId(order.paidAt).time} WIB</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── INFORMASI PENGIRIMAN CARD ────────────────────────────────────── */}
        {(addrName || order.shippingCourier || order.trackingNumber) && (
          <section className="w-full max-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-5 py-3.5">
              <h2 className="text-sm font-bold text-[#0F172A]">Informasi Pengiriman</h2>
            </div>
            <div className="space-y-4 px-5 py-4">
              {/* Shipping address */}
              {addrName && (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Alamat Tujuan</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{addrName}</p>
                  {addrPhone && <p className="mt-0.5 text-xs text-[#64748B]">{addrPhone}</p>}
                  <p className="mt-1 break-words text-xs leading-relaxed text-[#64748B]">
                    {[addrStreet, addrCity, addrProvince, addrPostal].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              {/* Courier info */}
              {(order.shippingCourier || order.shippingService) && (
                <div className="border-t border-[#F1F5F9] pt-3">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Kurir</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <svg className="h-4 w-4 fill-[#2563EB]" viewBox="0 0 24 24">
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {order.shippingCourier ?? ""}
                        {order.shippingService && (
                          <span className="ml-1 font-normal text-[#64748B]">· {order.shippingService}</span>
                        )}
                      </p>
                      {order.shippingServiceDescription && (
                        <p className="text-xs text-[#64748B]">{order.shippingServiceDescription}</p>
                      )}
                      {order.shippingEtd && (
                        <p className="text-xs text-[#64748B]">Estimasi {formatEtd(order.shippingEtd)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking number */}
              {order.trackingNumber && (
                <div className="border-t border-[#F1F5F9] pt-3">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Nomor Resi</p>
                  <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                    <p className="flex-1 font-mono text-sm font-bold tracking-wider text-[#0F172A]">
                      {order.trackingNumber}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(order.trackingNumber ?? "");
                        } catch { /* noop */ }
                      }}
                      className="text-xs font-semibold text-[#2563EB] transition hover:underline"
                    >
                      Salin
                    </button>
                  </div>
                </div>
              )}

              {/* Shipped at */}
              {order.shippedAt && (
                <div className="border-t border-[#F1F5F9] pt-3">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Dikirim Pada</p>
                  <p className="text-xs font-semibold text-[#0F172A]">{formatDateId(order.shippedAt).date}</p>
                  <p className="text-[11px] text-[#64748B]">{formatDateId(order.shippedAt).time} WIB</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── PRODUK DIPESAN CARD ──────────────────────────────────────────── */}
        <section className="w-full max-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A]">Produk Dipesan</h2>
              <span className="text-xs text-[#64748B]">{order.items.length} item</span>
            </div>
          </div>
          <div className="divide-y divide-[#F1F5F9] px-5">
            {order.items.map((item) => {
              const imgUrl = item.product?.images?.[0] ?? item.service?.images?.[0] ?? null;
              return (
                <div key={item.id} className="flex min-w-0 items-start gap-3 py-4 sm:items-center">
                  {/* Product image */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] sm:h-16 sm:w-16">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-[#0F172A]">{item.name}</p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  {/* Subtotal */}
                  <p className="shrink-0 text-right text-sm font-bold text-[#0F172A]">
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="border-t border-[#E2E8F0] px-5 py-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Catatan Pesanan</p>
              <p className="break-words text-sm leading-relaxed text-[#64748B]">{order.notes}</p>
            </div>
          )}
        </section>

        {/* ── RINGKASAN PEMBAYARAN CARD ────────────────────────────────────── */}
        <section className="w-full max-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-3.5">
            <h2 className="text-sm font-bold text-[#0F172A]">Ringkasan Pembayaran</h2>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-2.5 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between gap-3">
                <span className="text-[#64748B]">Subtotal Produk</span>
                <span className="text-right font-medium text-[#0F172A]">{formatRupiah(order.subtotal)}</span>
              </div>
              {/* Product discount */}
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Diskon Produk</span>
                  <span className="text-right font-medium text-[#EF4444]">-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}
              {/* Shipping cost */}
              {displayShipping > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Ongkos Kirim</span>
                  <span className="text-right font-medium text-[#0F172A]">{formatRupiah(displayShipping)}</span>
                </div>
              )}
              {/* Shipping discount */}
              {Number(order.shippingDiscount) > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-[#64748B]">Diskon Ongkir</span>
                  <span className="text-right font-medium text-[#EF4444]">-{formatRupiah(order.shippingDiscount)}</span>
                </div>
              )}
            </div>

            {/* Grand total */}
            <div className="mt-4 rounded-xl bg-[#EFF6FF] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-[#64748B]">
                    {canStillPay ? "Total yang harus dibayar" : "Total Pembayaran"}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F172A]">
                    {formatRupiah(displayTotal)}
                  </p>
                </div>
                {isPaid && (
                  <span className="rounded-full bg-[#16A34A]/10 px-3 py-1.5 text-xs font-bold text-[#16A34A]">
                    ✓ LUNAS
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── BUTUH BANTUAN CARD ───────────────────────────────────────────── */}
        <section className="w-full max-w-full rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Butuh bantuan?</p>
              <p className="mt-0.5 text-xs text-[#64748B]">Hubungi admin jika ada kendala dengan pesanan Anda.</p>
            </div>
            <a
              href={`/dashboard/pelanggan/${nama}/chat`}
              onClick={handleChatAdmin}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#2563EB] px-3.5 py-2 text-xs font-bold text-[#2563EB] transition hover:bg-[#EFF6FF]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              Chat Admin
            </a>
          </div>
        </section>

      </div>

      {/* ── MODAL: KONFIRMASI PESANAN DITERIMA ──────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4">
              <h2 className="text-base font-bold text-[#0F172A]">Konfirmasi Pesanan Diterima</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9]"
                aria-label="Tutup"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 px-5 py-5 pb-8">
              <p className="text-sm leading-relaxed text-[#64748B]">
                Pastikan Anda telah menerima barang dengan baik. Setelah konfirmasi, pesanan akan selesai dan rating/ulasan Anda akan tampil di halaman produk.
              </p>

              {/* 1. Upload proof */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  1. Upload Bukti Penerimaan <span className="text-[#EF4444]">*</span>
                </p>
                {confirmProof ? (
                  <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    <img src={confirmProof} alt="Bukti penerimaan" className="max-h-48 w-full object-contain" />
                    <div className="flex items-center justify-between border-t border-[#E2E8F0] px-3 py-2">
                      <span className="truncate text-xs text-[#64748B]">{confirmProofFile?.name ?? "Gambar terupload"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirmProof.startsWith("blob:")) URL.revokeObjectURL(confirmProof);
                          setConfirmProof("");
                          setConfirmProofFile(null);
                        }}
                        className="text-xs font-semibold text-[#EF4444] transition hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] px-4 py-8 text-center transition hover:border-[#2563EB] hover:bg-[#F8FAFC]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleConfirmProofFile(f);
                      }}
                    />
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
                      <svg className="h-5 w-5 fill-[#2563EB]" viewBox="0 0 24 24">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-[#0F172A]">Klik untuk pilih gambar</span>
                    <span className="text-[11px] text-[#94A3B8]">Format: JPG, JPEG, PNG, WEBP. Maks 5MB</span>
                  </label>
                )}
              </div>

              {/* 2. Rating & reviews */}
              {productItemsForReview.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">2. Rating & Ulasan Produk</p>
                  <div className="space-y-3">
                    {productItemsForReview.map((item) => {
                      const review = confirmReviews[item.id] ?? { rating: 0, comment: "" };
                      return (
                        <div key={item.id} className="rounded-xl border border-[#E2E8F0] p-4">
                          <p className="mb-2 truncate text-sm font-semibold text-[#0F172A]">{item.name}</p>
                          <div className="mb-3 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setConfirmReviews((prev) => ({
                                    ...prev,
                                    [item.id]: { ...(prev[item.id] ?? { rating: 0, comment: "" }), rating: star },
                                  }))
                                }
                                className="text-2xl leading-none transition-transform hover:scale-110"
                                aria-label={`${star} bintang`}
                              >
                                <span className={star <= review.rating ? "text-amber-400" : "text-slate-300"}>★</span>
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={review.comment}
                            onChange={(e) =>
                              setConfirmReviews((prev) => ({
                                ...prev,
                                [item.id]: { ...(prev[item.id] ?? { rating: 0, comment: "" }), comment: e.target.value },
                              }))
                            }
                            maxLength={1000}
                            placeholder="Bagikan pengalaman Anda menggunakan produk ini"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30"
                          />
                          <p className="mt-1 text-right text-[11px] text-[#94A3B8]">{review.comment.length}/1000</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {confirmError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444]">{confirmError}</p>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={confirming}
                  className="w-full rounded-xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#64748B] transition hover:bg-[#F8FAFC] sm:w-auto"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmReceived}
                  disabled={confirming || !confirmProof || !allRated}
                  className="w-full rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                >
                  {confirming ? "Memproses..." : "Konfirmasi Pesanan Diterima"}
                </button>
              </div>
              {!allRated && productItemsForReview.length > 0 && (
                <p className="text-center text-[11px] text-[#94A3B8]">Beri rating pada semua produk untuk melanjutkan.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RIWAYAT PESANAN ───────────────────────────────────────── */}
      <OrderHistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        events={buildOrderHistory(order)}
        title="Detail Pengiriman"
      />
    </>
  );
}

// ── Payment option component ─────────────────────────────────────────────────
function PaymentOption({
  label,
  desc,
  active,
  onClick,
}: {
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-w-0 items-center gap-3 rounded-xl border bg-white p-3 text-left transition ${
        active
          ? "border-[#2563EB] ring-1 ring-[#2563EB]/30"
          : "border-[#E2E8F0] hover:border-[#2563EB]/40"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-[#2563EB]" : "border-[#CBD5E1]"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-semibold text-[#0F172A]">{label}</span>
        <span className="block break-words text-xs text-[#64748B]">{desc}</span>
      </span>
    </button>
  );
}

// ── Shipping option list component ───────────────────────────────────────────
function ShippingOptionList({
  options,
  selected,
  onSelect,
}: {
  options: ShippingOption[];
  selected: ShippingOption | null;
  onSelect: (opt: ShippingOption) => void;
}) {
  return (
    <div className="space-y-2">
      {COURIERS.map((c) => {
        const courierOptions = options.filter((o) => o.code === c.code);
        if (!courierOptions.length) return null;
        return (
          <div key={c.code} className="space-y-2">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">{c.name}</p>
            {courierOptions.map((opt) => {
              const active = selected?.code === opt.code && selected?.service === opt.service;
              return (
                <button
                  key={`${opt.code}-${opt.service}`}
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`flex w-full min-w-0 items-start gap-3 rounded-xl border bg-white p-3 text-left transition sm:items-center ${
                    active
                      ? "border-[#2563EB] ring-1 ring-[#2563EB]/30"
                      : "border-[#E2E8F0] hover:border-[#2563EB]/40"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      active ? "border-[#2563EB]" : "border-[#CBD5E1]"
                    }`}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold text-[#0F172A]">
                      {opt.service}{" "}
                      <span className="font-normal text-[#64748B]">· {opt.description}</span>
                    </span>
                    <span className="block text-xs text-[#64748B]">Estimasi {formatEtd(opt.etd)}</span>
                  </span>
                  <span className="max-w-[38%] shrink-0 text-right text-sm font-bold text-[#0F172A] sm:max-w-none">
                    {formatRupiah(opt.cost)}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
