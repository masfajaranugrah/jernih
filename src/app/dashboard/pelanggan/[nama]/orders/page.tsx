"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getChatSocket } from "@/lib/chatSocket";
import { getToken } from "@/lib/auth";

const tabs = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai", "Dibatalkan"] as const;

/** Map tab → status backend (bisa lebih dari satu) */
const tabStatus: Record<string, string> = {
  Semua: "",
  "Belum Bayar": "PENDING",
  Dikemas: "CONFIRMED,PROCESSING",
  Dikirim: "SHIPPED",
  Selesai: "DELIVERED",
  Dibatalkan: "CANCELLED,REFUNDED,EXPIRED",
};

const PAGE_SIZE = 20;

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
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
  total: string;
  subtotal: string;
  createdAt: string;
  items: ApiOrderItem[];
  paymentDeadline: string | null;
  serverTime: string | null;
  shippedAt: string | null;
  canConfirmReceived: boolean;
  confirmReceivedAvailableAt: string | null;
  payment: { status: string; method: string | null; label: string | null };
  snapToken?: string | null;
};

type ApiPromo = {
  id: string;
  title: string;
  description?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  code?: string | null;
  minPurchase?: number | null;
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
  EXPIRED: "Dibatalkan",
};

/** Status badge styles — modern marketplace palette */
const statusBadge: Record<string, string> = {
  "Belum Bayar": "bg-amber-50 text-amber-700 border border-amber-200",
  Dikemas: "bg-blue-50 text-blue-700 border border-blue-200",
  Dikirim: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Selesai: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Dibatalkan: "bg-red-50 text-red-600 border border-red-200",
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

/** Countdown berdasarkan paymentDeadline dari backend */
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

/* ─────────────────────────── Skeleton Card ─────────────────────────── */
function SkeletonCard() {
  return (
    <div className="w-full rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm animate-pulse">
      {/* header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-slate-100" />
          <div className="h-2.5 w-20 rounded bg-slate-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>
      {/* items */}
      <div className="mb-4 space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-slate-100" />
              <div className="h-2.5 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      {/* footer */}
      <div className="flex items-end justify-between border-t border-[#E2E8F0] pt-4">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-slate-100" />
          <div className="h-5 w-24 rounded bg-slate-100" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/* ─────────────────────────── Order Card ─────────────────────────── */
function OrderCard({
  order,
  nama,
  onExpired,
}: {
  order: ApiOrder;
  nama: string;
  onExpired?: () => void;
}) {
  const router = useRouter();
  const label = statusLabel[order.status];
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();

  const paymentStatus = order.payment?.status ?? "PENDING";
  const isUnpaid = paymentStatus === "PENDING" || paymentStatus === "UNPAID";
  const showCountdown = isUnpaid && order.status === "PENDING" && !!order.paymentDeadline;
  const remaining = useCountdown(showCountdown ? order.paymentDeadline : null, order.serverTime);

  useEffect(() => {
    if (showCountdown && remaining === 0) onExpired?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, showCountdown]);

  return (
    <div
      onClick={() => router.push(`/dashboard/pelanggan/${nama}/orders/${order.id}`)}
      className="group w-full min-w-0 max-w-full cursor-pointer overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
    >
      {/* Card Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div className="min-w-0">
          <span className="block text-sm font-bold text-[#0F172A]">
            #{displayNumber}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">
            {formatDate(order.createdAt)}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            statusBadge[label] ?? "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Items */}
      <div className="mb-4 space-y-3">
        {order.items.slice(0, 2).map((item) => {
          const imgUrl =
            item.product?.images?.[0] ?? item.service?.images?.[0] ?? null;
          return (
            <div key={item.id} className="flex min-w-0 items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F8FAFC]">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl text-slate-300">
                    📦
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-[#111827]">
                  {item.name}
                </h4>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {item.quantity} × {formatRupiah(item.price)}
                </p>
              </div>
            </div>
          );
        })}
        {order.items.length > 2 && (
          <p className="text-xs font-medium text-blue-600">
            +{order.items.length - 2} item lainnya
          </p>
        )}
      </div>

      {/* Countdown */}
      {showCountdown && remaining !== null && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-amber-700">
            Selesaikan pembayaran dalam
          </p>
          <p className="font-mono text-sm font-bold tabular-nums text-amber-800">
            {formatCountdown(remaining)[0]}:{formatCountdown(remaining)[1]}:{formatCountdown(remaining)[2]}
          </p>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#E2E8F0] pt-4">
        <div className="min-w-0">
          <p className="text-[11px] text-[#64748B]">Total Belanja</p>
          <p className="break-words text-base font-bold text-[#0F172A] sm:text-lg">
            {formatRupiah(order.total)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {order.status === "SHIPPED" && (
            <>
              {order.canConfirmReceived ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Konfirmasi Diterima
                </span>
              ) : (
                <span className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200">
                  Menunggu konfirmasi
                </span>
              )}
            </>
          )}
          <span className="inline-flex items-center gap-1 rounded-xl bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
            Lihat Detail
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Promo Banner ─────────────────────────── */
function PromoBanner({ promo }: { promo: ApiPromo | null }) {
  if (promo) {
    return (
      <div className="mb-6 flex flex-col gap-3 overflow-hidden rounded-xl border border-blue-200 bg-[#EFF6FF] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1D4ED8]">{promo.title}</p>
            <p className="mt-0.5 text-xs text-blue-600">
              {promo.discountPercent != null && (
                <span>Diskon {promo.discountPercent}%</span>
              )}
              {promo.discountAmount != null && promo.discountPercent == null && (
                <span>Hemat {formatRupiah(promo.discountAmount)}</span>
              )}
              {promo.code && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-white border border-blue-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#2563EB]">
                  {promo.code}
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/promo"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8] sm:ml-2"
        >
          Lihat Promo
        </Link>
      </div>
    );
  }

  /* Fallback static banner */
  return (
    <div className="mb-6 flex flex-col gap-3 overflow-hidden rounded-xl border border-blue-200 bg-[#EFF6FF] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1D4ED8]">Promo Spesial Menanti!</p>
          <p className="mt-0.5 text-xs text-blue-600">
            Cek promo terbaru dan hemat lebih banyak untuk setiap pembelian.
          </p>
        </div>
      </div>
      <Link
        href="/promo"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8]"
      >
        Lihat Promo
      </Link>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function OrdersPelangganPage({
  params,
}: {
  params: Promise<{ nama: string }>;
}) {
  const nama = use(params).nama;
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /* Promo banner state */
  const [promo, setPromo] = useState<ApiPromo | null>(null);
  const [promoLoaded, setPromoLoaded] = useState(false);

  /* Realtime toast */
  const [showToast, setShowToast] = useState(false);

  /* Fetch promo once on mount */
  useEffect(() => {
    fetch("/api/promos?status=active&limit=1", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const item =
          Array.isArray(data) ? data[0] : data?.data?.[0] ?? null;
        setPromo(item ?? null);
      })
      .catch(() => setPromo(null))
      .finally(() => setPromoLoaded(true));
  }, []);

  /* Fetch orders */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const status = tabStatus[activeTab];
    fetch(
      `/api/orders?status=${encodeURIComponent(status)}&page=${page}&limit=${PAGE_SIZE}`,
      { cache: "no-store" },
    )
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Gagal memuat pesanan");
        }
        return res.json();
      })
      .then(
        (data: {
          data?: ApiOrder[];
          meta?: { total: number; totalPages: number };
        }) => {
          if (cancelled) return;
          const rawItems: ApiOrder[] = Array.isArray(data) ? data : (data?.data ?? []);
          // Sembunyikan order PENDING yang belum pernah sampai ke tahap pembayaran
          // (snapToken null = pelanggan belum klik "Bayar Sekarang" / belum pilih metode bayar).
          // Order baru muncul di daftar setelah pelanggan memulai proses pembayaran.
          const items = rawItems.filter(
            (o) => !(o.status === "PENDING" && !o.snapToken)
          );
          setOrders(items);
          setTotal(
            Array.isArray(data)
              ? items.length
              : (data?.meta?.total ?? items.length),
          );
          setTotalPages(
            Array.isArray(data) ? 1 : (data?.meta?.totalPages ?? 1),
          );
        },
      )
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, page, reloadKey]);

  /* Polling: reload every 30s when there are PENDING orders */
  useEffect(() => {
    if (!orders.some((o) => o.status === "PENDING")) return;
    const timer = setInterval(() => setReloadKey((k) => k + 1), 30_000);
    return () => clearInterval(timer);
  }, [orders]);

  /* Realtime socket */
  useEffect(() => {
    const socket = getChatSocket(getToken() ?? undefined);
    const onStatus = (payload: { orderId?: string; status?: string }) => {
      if (!payload?.orderId || !payload?.status) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.orderId
            ? { ...o, status: payload.status as ApiOrder["status"] }
            : o,
        ),
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    };
    socket.on("order:status", onStatus);
    return () => {
      socket.off("order:status", onStatus);
    };
  }, []);

  const filtered =
    activeTab === "Semua"
      ? orders
      : orders.filter((o) => statusLabel[o.status] === activeTab);

  return (
    <div className="mx-auto w-full max-w-[calc(100vw-3rem)] min-w-0 pb-[calc(1rem+env(safe-area-inset-bottom))] md:max-w-full">

      {/* ── Realtime Toast ── */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg">
          <span className="text-base">✅</span>
          <span className="text-sm font-semibold text-[#0F172A]">Status pesanan diperbarui</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
        <div className="flex items-center gap-3">
          {/* Back button — mobile only */}
          <div className="md:hidden">
            <Link
              href={`/dashboard/pelanggan/${nama}/profile`}
              aria-label="Kembali"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm transition-colors hover:bg-[#F8FAFC] active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
          </div>
          <div>
            <h1
              className="text-[#0F172A] font-bold tracking-tight text-2xl md:text-3xl"
              style={{ lineHeight: "1.25", letterSpacing: "-0.02em" }}
            >
              Pesanan Saya
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Pantau status pesanan dan riwayat belanja Anda.
            </p>
          </div>
        </div>
        {/* Cari Pesanan button — UI only */}
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:border-blue-200 hover:bg-[#EFF6FF] hover:text-[#2563EB]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Cari Pesanan
        </button>
      </div>

      {/* ── Promo Banner ── */}
      {promoLoaded && <PromoBanner promo={promo} />}

      {/* ── Tabs ── */}
      <div className="mb-6 border-b border-[#E2E8F0]">
        <div
          className="flex gap-0 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-slate-500 hover:text-[#2563EB]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        /* Error state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-bold text-red-700">Gagal Memuat Pesanan</p>
          <p className="mb-5 max-w-xs text-xs text-red-500">{error}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF]">
            <svg className="h-8 w-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="mb-1 text-base font-bold text-[#0F172A]">
            {activeTab === "Semua" ? "Belum Ada Pesanan" : `Tidak Ada Pesanan ${activeTab}`}
          </p>
          <p className="mb-6 max-w-xs text-sm text-[#64748B]">
            {activeTab === "Semua"
              ? "Yuk mulai belanja dan temukan produk favoritmu!"
              : "Tidak ada pesanan di kategori ini saat ini."}
          </p>
          {activeTab === "Semua" && (
            <Link
              href="/"
              className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Mulai Belanja
            </Link>
          )}
        </div>
      ) : (
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              nama={nama}
              onExpired={() => setReloadKey((k) => k + 1)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && !loading && !error && (
        <div className="mt-8 flex flex-col gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#64748B]">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} dari {total} pesanan
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:border-blue-200 hover:bg-[#EFF6FF] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="min-w-[60px] text-center text-sm font-semibold text-[#0F172A]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:border-blue-200 hover:bg-[#EFF6FF] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
