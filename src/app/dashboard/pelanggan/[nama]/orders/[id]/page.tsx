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
    const onStatus = (payload: { orderId?: string; status?: string }) => {
      if (payload?.orderId !== id) return;
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
        // Response update shipping berupa row orders tanpa relasi items → gabungkan
        // dgn state lama agar items & data enrich (paymentDeadline dsb) tetap utuh.
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
   *
   * Aturan:
   * - Setiap event punya timestamp yang mencerminkan waktu kejadian sebenarnya.
   * - Untuk event yang tidak punya timestamp eksplisit di backend, gunakan
   *   estimasi bertahap (t+1 detik dari event sebelumnya) agar sort konsisten.
   * - isCurrent = true hanya pada status yang sedang aktif saat ini.
   * - Hasil diurutkan dari terbaru (atas) ke terlama (bawah).
   */
  function buildOrderHistory(o: OrderDetail): OrderHistoryEvent[] {
    type RawEvent = OrderHistoryEvent & { _order: number };
    const raw: RawEvent[] = [];

    const payStatus = o.payment?.status ?? "PENDING";
    const methodLbl =
      o.payment?.label ??
      (o.paymentMethod ? (METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod) : null);

    // Tentukan status aktif saat ini
    const currentStatus = o.status;

    // Helper: tambah event ke list
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

    // ── 1. Pesanan dibuat (selalu ada) ───────────────────────────────────
    push(
      {
        ts: o.createdAt,
        title: "Pesanan dibuat",
        description: "Pesanan berhasil dibuat",
        isCurrent: currentStatus === "PENDING" && payStatus !== "PAID",
      },
      1,
    );

    // ── 2. Pembayaran ────────────────────────────────────────────────────
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

    // ── 3. Pesanan diproses ──────────────────────────────────────────────
    if (
      currentStatus === "PROCESSING" ||
      currentStatus === "SHIPPED" ||
      currentStatus === "DELIVERED"
    ) {
      // Backend tidak punya field "processedAt", pakai paidAt + 1 detik sebagai estimasi
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

    // ── 4. Pesanan dikirim ───────────────────────────────────────────────
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

    // ── 5. Pesanan diterima ──────────────────────────────────────────────
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

    // ── 5b. Dibatalkan ───────────────────────────────────────────────────
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

    // ── 5c. Refunded ─────────────────────────────────────────────────────
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

    // Urutkan berdasarkan _order descending (status terbaru/aktif di atas)
    // Jika _order sama, gunakan timestamp sebagai tiebreaker
    raw.sort((a, b) => {
      if (b._order !== a._order) return b._order - a._order;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Buang field internal _order sebelum return
    return raw.map(({ _order: _o, ...rest }) => rest);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
      </div>
    );
  }

  if (!order) return null;

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
    <div className="mx-auto w-full max-w-[880px] min-w-0 space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:space-y-5">
      {/* Header */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/pelanggan/${nama}/orders`)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#e2e8f0] transition"
          aria-label="Kembali"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#191c1d]">Detail Pesanan</h1>
          <p className="break-words text-xs text-[#707974]">{order.orderNumber}</p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#064e3b] sm:px-5">
          {successMsg}
        </div>
      )}

      {/* ── 1. STATUS / METODE PEMBAYARAN ─────────────────────────────────── */}
      <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
        {isPaid ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#064e3b]">
              {/* Icon sesuai status order */}
              {order.status === "DELIVERED" ? (
                /* Bintang / selesai */
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ) : order.status === "SHIPPED" ? (
                /* Truk pengiriman */
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              ) : order.status === "PROCESSING" ? (
                /* Gear / proses */
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
              ) : (
                /* Centang default (CONFIRMED / PAID) */
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#064e3b]">
                {ORDER_STATUS_LABEL[order.status] ?? "Pembayaran Berhasil"}
              </p>
              {methodLabel && (
                <p className="text-xs text-[#707974]">Bayar melalui {methodLabel}</p>
              )}
            </div>
          </div>
        ) : isExpired || (isCancelled && order.status === "CANCELLED" && !canStillPay) ? (
          <div>
            <p className="text-base font-bold text-[#93000a]">Pesanan Dibatalkan</p>
            <p className="mt-1 text-xs text-[#475569]">
              Pesanan dibatalkan otomatis karena pembayaran tidak dilakukan dalam batas waktu.
            </p>
          </div>
        ) : isUnpaid && order.status === "PENDING" ? (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[#707974]">
                  {methodLabel ? "Bayar melalui" : "Metode pembayaran"}
                </p>
                <p className="mt-0.5 break-words text-sm font-bold text-[#191c1d]">
                  {methodLabel ?? "Belum dipilih"}
                </p>
                <p className="mt-1 inline-block rounded-full bg-[#ffdad6] px-2.5 py-1 text-xs font-semibold text-[#93000a]">
                  Menunggu Pembayaran
                </p>
              </div>
              <button
                onClick={() => setShowPayPanel((v) => !v)}
                className="w-full shrink-0 rounded-xl bg-[#064e3b] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d] sm:w-auto"
              >
                {showPayPanel ? "Tutup" : "Bayar Sekarang"}
              </button>
            </div>

            {showCountdown && remaining !== null && (
              <div className="mt-4 overflow-hidden rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3">
                <p className="text-xs font-semibold text-[#c2410c]">Selesaikan pembayaran dalam</p>
                <p className="mt-1 whitespace-nowrap font-mono text-xl font-bold tabular-nums tracking-tight text-[#9a3412] sm:text-2xl">
                  {formatCountdown(remaining)[0]}
                  <span className="mx-0.5 text-[#fdba74]">:</span>
                  {formatCountdown(remaining)[1]}
                  <span className="mx-0.5 text-[#fdba74]">:</span>
                  {formatCountdown(remaining)[2]}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-[#c2410c]">
                  Pesanan akan dibatalkan otomatis jika pembayaran tidak diterima dalam 24 jam.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-base font-bold text-[#93000a]">Pembayaran Gagal</p>
            {methodLabel && <p className="mt-1 text-xs text-[#475569]">Bayar melalui {methodLabel}</p>}
            {canStillPay && (
              <button
                onClick={() => setShowPayPanel(true)}
                className="mt-3 rounded-xl bg-[#064e3b] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#043b2d]"
              >
                Bayar Sekarang
              </button>
            )}
          </div>
        )}

        {/* Status terpisah: order */}
        {(isPaid || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") && (
          <div className="mt-3 border-t border-[#e2e8f0] pt-3 text-[11px] text-[#707974]">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="group flex items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-[#f0fdf4] cursor-pointer -ml-2"
              title="Lihat riwayat pesanan"
            >
              <span>
                Order Status:{" "}
                <span className="font-semibold text-[#191c1d] group-hover:text-[#064e3b] transition-colors">
                  {ORDER_STATUS_LABEL[order.status] ?? order.status}
                </span>
              </span>
              <svg
                className="h-3.5 w-3.5 shrink-0 text-[#94a3b8] transition-colors group-hover:text-[#064e3b]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Panel bayar (metode + pengiriman) ─────────────────────────────── */}
        {canStillPay && showPayPanel && (
          <div className="mt-4 space-y-4 border-t border-[#e2e8f0] pt-4">
            {/* Pengiriman */}
            {order.address && (
              <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 sm:gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#707974]">Pengiriman</p>
                  {shippingTotalWeightKg != null && (
                    <p className="text-xs text-[#707974]">
                      Berat: <span className="font-bold text-[#191c1d]">{formatWeightKg(shippingTotalWeightKg)}</span>
                    </p>
                  )}
                </div>
                {shippingLoading ? (
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
                    Menghitung biaya pengiriman...
                  </p>
                ) : shippingError ? (
                  <p className="text-xs font-semibold text-[#dc2626]">{shippingError}</p>
                ) : shippingOptions.length === 0 ? (
                  <p className="text-xs text-[#707974]">Tidak ada layanan pengiriman tersedia untuk alamat ini.</p>
                ) : (
                  <ShippingOptionList
                    options={shippingOptions}
                    selected={selectedShipping}
                    onSelect={setSelectedShipping}
                  />
                )}
              </div>
            )}

            {/* Metode pembayaran */}
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#707974]">Metode Pembayaran</p>
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

            {payError && <p className="text-xs font-semibold text-[#dc2626]">{payError}</p>}

            {/* Ringkasan biaya */}
            {selectedMethod && (
              <div className="rounded-lg bg-[#f8f9fa] px-3 py-3 text-sm sm:px-4">
                <div className="flex min-w-0 justify-between gap-3 text-[#475569]">
                  <span>Total Pesanan</span>
                  <span className="text-right">{formatRupiah(displayTotal)}</span>
                </div>
                {selectedFee > 0 && (
                  <div className="mt-1 flex min-w-0 justify-between gap-3 text-[#475569]">
                    <span>Biaya Admin</span>
                    <span className="text-right">{formatRupiah(selectedFee)}</span>
                  </div>
                )}
                <div className="mt-1 flex min-w-0 justify-between gap-3 border-t border-[#e1e3e4] pt-1.5 font-bold text-[#191c1d]">
                  <span>Total Bayar</span>
                  <span className="text-right">{formatRupiah(amountToPay)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={!canPay}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d] disabled:cursor-not-allowed disabled:opacity-50"
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
      </section>

      {/* ── KONFIRMASI PENERIMAAN (SHIPPED) ─────────────────────────────── */}
      {order.status === "SHIPPED" && (
        <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
          <h2 className="mb-3 text-sm font-bold text-[#191c1d]">Konfirmasi Penerimaan</h2>
          {order.canConfirmReceived ? (
            <>
              <p className="text-sm text-[#475569] leading-relaxed">
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
                className="mt-3 w-full sm:w-auto rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d]"
              >
                Pesanan Diterima
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#475569] leading-relaxed">
                Pesanan Anda sedang dalam perjalanan. Anda dapat mengkonfirmasi pesanan diterima setelah{" "}
                <span className="font-semibold text-[#191c1d]">
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
                className="mt-3 w-full sm:w-auto rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d]"
              >
                Pesanan Diterima
              </button>
            </>
          )}
        </section>
      )}

      {/* ── 2. ALAMAT PENGIRIMAN ──────────────────────────────────────────── */}
      {addrName && (
        <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
          <h2 className="mb-3 text-sm font-bold text-[#191c1d]">Alamat Pengiriman</h2>
          <p className="break-words text-sm font-semibold text-[#191c1d]">{addrName}</p>
          {addrPhone && <p className="mt-0.5 text-xs text-[#475569]">{addrPhone}</p>}
          <p className="mt-1.5 break-words text-xs leading-relaxed text-[#475569]">
            {[addrStreet, addrCity, addrProvince, addrPostal].filter(Boolean).join(", ")}
          </p>
        </section>
      )}

      {/* ── 3. PRODUK ─────────────────────────────────────────────────────── */}
      <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
        <h2 className="mb-2 text-sm font-bold text-[#191c1d]">Produk</h2>
        <div className="divide-y divide-[#e2e8f0]">
          {order.items.map((item) => {
            const imgUrl = item.product?.images?.[0] ?? item.service?.images?.[0] ?? null;
            return (
              <div key={item.id} className="flex min-w-0 items-start gap-3 py-3 sm:items-center">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9] sm:h-14 sm:w-14">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl text-[#94a3b8]">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-[#191c1d] sm:line-clamp-1">{item.name}</p>
                  <p className="mt-0.5 text-xs text-[#707974]">
                    Qty {item.quantity} · {formatRupiah(item.price)}
                  </p>
                </div>
                <p className="max-w-[40%] shrink-0 text-right text-sm font-semibold text-[#191c1d] sm:max-w-none">{formatRupiah(item.subtotal)}</p>
              </div>
            );
          })}
        </div>
        {order.notes && (
          <div className="mt-2 border-t border-[#e2e8f0] pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#707974]">Catatan</p>
            <p className="mt-1 break-words text-sm text-[#475569]">{order.notes}</p>
          </div>
        )}
      </section>

      {/* ── 4 & 5. DETAIL PEMBAYARAN + TOTAL ─────────────────────────────── */}
      <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
        <h2 className="mb-3 text-sm font-bold text-[#191c1d]">Detail Pembayaran</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3 text-[#475569]">
            <span>Subtotal Produk</span>
            <span className="text-right">{formatRupiah(order.subtotal)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between gap-3 text-[#dc2626]">
              <span>Diskon Produk</span>
              <span className="text-right">-{formatRupiah(order.discountAmount)}</span>
            </div>
          )}
          {displayShipping > 0 && (
            <div className="flex justify-between gap-3 text-[#475569]">
              <span>Pengiriman</span>
              <span className="text-right">{formatRupiah(displayShipping)}</span>
            </div>
          )}
          {Number(order.shippingDiscount) > 0 && (
            <div className="flex justify-between gap-3 text-[#dc2626]">
              <span>Diskon Ongkir</span>
              <span className="text-right">-{formatRupiah(order.shippingDiscount)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-[#f8f9fa] px-3 py-4 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#707974]">
              {canStillPay ? "Total yang harus dibayar" : "Total Pembayaran"}
            </p>
            {isPaid && (
              <span className="rounded-full bg-[#064e3b]/10 px-2.5 py-1 text-[11px] font-bold text-[#064e3b]">
                LUNAS
              </span>
            )}
          </div>
          <p className="mt-1 break-words text-2xl font-bold tabular-nums text-[#003527]">{formatRupiah(displayTotal)}</p>
        </div>
      </section>

      {/* ── 6. BANTUAN — CHAT ADMIN ──────────────────────────────────────── */}
      <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
        <p className="text-sm font-semibold text-[#191c1d]">Butuh bantuan?</p>
        <a
          href={`/dashboard/pelanggan/${nama}/chat`}
          onClick={handleChatAdmin}
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#064e3b] underline underline-offset-4 hover:text-[#043b2d]"
        >
          Chat dengan Admin
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </a>
      </section>

      {/* ── 7 & 8. NOMOR PESANAN + WAKTU PESANAN ─────────────────────────── */}
      <section className="w-full max-w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-5 shadow-sm sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#707974]">Nomor Pesanan</p>
            <p className="mt-0.5 break-words text-sm font-bold text-[#191c1d]">#{order.orderNumber}</p>
          </div>
          <button
            onClick={copyOrderNumber}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#064e3b] hover:bg-[#f3f4f5]"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            {copied ? "Disalin!" : "Salin"}
          </button>
        </div>
        <div className="mt-4 border-t border-[#e2e8f0] pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#707974]">Waktu Pesanan</p>
          <p className="mt-1 text-sm font-semibold text-[#191c1d]">{created.date}</p>
          <p className="text-xs text-[#475569]">{created.time} WIB</p>
        </div>
      </section>
    </div>

    {/* ── MODAL KONFIRMASI PESANAN DITERIMA ─────────────────────────────── */}
    {showConfirmModal && (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
        <div
          className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-4">
            <h2 className="text-base font-bold text-[#191c1d]">Konfirmasi Pesanan Diterima</h2>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#707974] hover:bg-[#f3f4f5]"
              aria-label="Tutup"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <div className="space-y-5 px-5 py-5 pb-8">
            <p className="text-sm text-[#475569] leading-relaxed">
              Pastikan Anda telah menerima barang dengan baik. Setelah konfirmasi, pesanan akan selesai dan rating/ulasan Anda akan tampil di halaman produk.
            </p>

            {/* 1. Upload bukti penerimaan */}
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#707974]">1. Upload Bukti Penerimaan *</p>
              {confirmProof ? (
                <div className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#f8f9fa]">
                  <img src={confirmProof} alt="Bukti penerimaan" className="max-h-48 w-full object-contain" />
                  <div className="flex items-center justify-between border-t border-[#e2e8f0] px-3 py-2">
                    <span className="truncate text-xs text-[#475569]">{confirmProofFile?.name ?? "Gambar terupload"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmProof.startsWith("blob:")) URL.revokeObjectURL(confirmProof);
                        setConfirmProof("");
                        setConfirmProofFile(null);
                      }}
                      className="text-xs font-semibold text-[#dc2626] hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#bfc9c3] px-4 py-8 text-center transition hover:border-[#064e3b] hover:bg-[#f8f9fa]">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleConfirmProofFile(f);
                    }}
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#064e3b]">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-[#191c1d]">Klik untuk pilih gambar</span>
                  <span className="text-[11px] text-[#94a3b8]">Format: JPG, JPEG, PNG, WEBP. Maks 5MB</span>
                </label>
              )}
            </div>

            {/* 2. Rating & ulasan per produk */}
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#707974]">2. Rating & Ulasan Produk</p>
              <div className="space-y-4">
                {productItemsForReview.map((item) => {
                  const review = confirmReviews[item.id] ?? { rating: 0, comment: "" };
                  return (
                    <div key={item.id} className="rounded-lg border border-[#e2e8f0] p-3">
                      <p className="mb-2 truncate text-sm font-semibold text-[#191c1d]">{item.name}</p>
                      <div className="mb-2 flex items-center gap-1">
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
                        className="w-full resize-none rounded-lg border border-[#e2e8f0] bg-white p-3 text-sm text-[#191c1d] outline-none transition focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]/30"
                      />
                      <p className="mt-1 text-right text-[11px] text-[#94a3b8]">{review.comment.length}/1000</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {confirmError && (
              <p className="rounded-lg bg-[#ffdad6] px-3 py-2.5 text-sm font-semibold text-[#93000a]">{confirmError}</p>
            )}

            {/* Aksi */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={confirming}
                className="w-full rounded-xl border border-[#bfc9c3] px-5 py-3 text-sm font-bold text-[#404944] transition hover:bg-[#f3f4f5] sm:w-auto"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReceived}
                disabled={confirming || !confirmProof || !allRated}
                className="w-full rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {confirming ? "Memproses..." : "Konfirmasi Pesanan Diterima"}
              </button>
            </div>
            {!allRated && <p className="text-center text-[11px] text-[#94a3b8]">Beri rating pada semua produk untuk melanjutkan.</p>}
          </div>
        </div>
      </div>
    )}

    {/* ── MODAL RIWAYAT PESANAN ──────────────────────────────────────────── */}
    <OrderHistoryModal
      open={showHistoryModal}
      onClose={() => setShowHistoryModal(false)}
      events={buildOrderHistory(order)}
      title="Detail Pengiriman"
    />
    </>
  );
}

/** Opsi metode pembayaran yang bisa dipilih / diganti */
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
        active ? "border-[#064e3b] ring-1 ring-[#064e3b]/40" : "border-[#e2e8f0] hover:border-[#bfc9c3]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-[#064e3b]" : "border-[#bfc9c3]"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-[#064e3b]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-semibold text-[#191c1d]">{label}</span>
        <span className="block break-words text-xs text-[#707974]">{desc}</span>
      </span>
    </button>
  );
}

/** Daftar pilihan ongkir, dikelompokkan per kurir sesuai urutan COURIERS */
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
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">{c.name}</p>
            {courierOptions.map((opt) => {
              const active = selected?.code === opt.code && selected?.service === opt.service;
              return (
                <button
                  key={`${opt.code}-${opt.service}`}
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`flex w-full min-w-0 items-start gap-3 rounded-xl border bg-white p-3 text-left transition sm:items-center ${
                    active ? "border-[#064e3b] ring-1 ring-[#064e3b]/40" : "border-[#e2e8f0] hover:border-[#bfc9c3]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      active ? "border-[#064e3b]" : "border-[#bfc9c3]"
                    }`}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-[#064e3b]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold text-[#191c1d]">
                      {opt.service} <span className="font-medium text-[#707974]">· {opt.description}</span>
                    </span>
                    <span className="block text-xs text-[#707974]">Estimasi {formatEtd(opt.etd)}</span>
                  </span>
                  <span className="max-w-[38%] shrink-0 text-right text-sm font-bold text-[#191c1d] sm:max-w-none">{formatRupiah(opt.cost)}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
