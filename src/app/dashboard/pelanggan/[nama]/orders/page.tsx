"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const tabs = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai"] as const;

/** Map tab → status backend (bisa lebih dari satu) */
const tabStatus: Record<string, string> = {
  Semua: "",
  "Belum Bayar": "PENDING",
  Dikemas: "CONFIRMED,PROCESSING",
  Dikirim: "SHIPPED",
  Selesai: "DELIVERED",
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

function OrderCard({ order, nama, onExpired }: { order: ApiOrder; nama: string; onExpired?: () => void }) {
  const router = useRouter();
  const label = statusLabel[order.status];
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();

  const paymentStatus = order.payment?.status ?? "PENDING";
  const isUnpaid = paymentStatus === "PENDING" || paymentStatus === "UNPAID";
  const showCountdown = isUnpaid && order.status === "PENDING" && !!order.paymentDeadline;
  const remaining = useCountdown(showCountdown ? order.paymentDeadline : null, order.serverTime);

  // Saat countdown habis, muat ulang list (backend yang membatalkan order)
  useEffect(() => {
    if (showCountdown && remaining === 0) onExpired?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, showCountdown]);

  return (
    <div
      onClick={() => router.push(`/dashboard/pelanggan/${nama}/orders/${order.id}`)}
      className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-transparent bg-white p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all hover:border-[#bfc9c3] hover:shadow-md sm:p-6 cursor-pointer group"
    >
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e3e4] pb-3">
          <div className="min-w-0 flex-1">
            <span className="block break-words text-sm font-bold text-[#191c1d]">#{displayNumber}</span>
            <span className="text-xs text-[#475569] block mt-0.5">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[label] ?? "bg-[#e7e8e9] text-[#404944]"}`}>
              {label}
            </span>
            <svg className="hidden h-4 w-4 text-[#94a3b8] transition-colors group-hover:text-[#003527] min-[360px]:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          {order.items.slice(0, 2).map((item) => {
            const imgUrl = item.product?.images?.[0] ?? item.service?.images?.[0] ?? null;
            return (
              <div key={item.id} className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9] sm:h-12 sm:w-12">
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

      {showCountdown && remaining !== null && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2">
          <p className="text-[11px] font-semibold text-[#c2410c]">Selesaikan pembayaran dalam</p>
          <p className="font-mono text-sm font-bold tabular-nums text-[#9a3412]">
            {formatCountdown(remaining)[0]} : {formatCountdown(remaining)[1]} : {formatCountdown(remaining)[2]}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[#e1e3e4] pt-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[#475569]">Total Belanja</p>
          <p className="break-words text-lg font-semibold text-[#003527] sm:text-xl">{formatRupiah(order.total)}</p>
        </div>
        {order.status === "SHIPPED" && (
          <div className="shrink-0">
            {order.canConfirmReceived ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#064e3b]/10 px-3 py-1.5 text-xs font-bold text-[#064e3b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#064e3b]" />
                Konfirmasi Diterima
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg bg-[#fff7ed] px-3 py-1.5 text-xs font-semibold text-[#c2410c]">
                Menunggu konfirmasi
              </span>
            )}
          </div>
        )}
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
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const status = tabStatus[activeTab];
    fetch(`/api/orders?status=${encodeURIComponent(status)}&page=${page}&limit=${PAGE_SIZE}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? "Gagal memuat pesanan");
        }
        return res.json();
      })
      .then((data: { data?: ApiOrder[]; meta?: { total: number; totalPages: number }; }) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : (data?.data ?? []);
        setOrders(items);
        setTotal(Array.isArray(data) ? items.length : (data?.meta?.total ?? items.length));
        setTotalPages(Array.isArray(data) ? 1 : (data?.meta?.totalPages ?? 1));
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, page, reloadKey]);

  // Polling ringan: saat ada order PENDING, muat ulang list tiap 30 detik
  // supaya status (lunas/dibatalkan) & countdown selalu segar dari backend.
  useEffect(() => {
    if (!orders.some((o) => o.status === "PENDING")) return;
    const timer = setInterval(() => setReloadKey((k) => k + 1), 30_000);
    return () => clearInterval(timer);
  }, [orders]);

  const filtered =
    activeTab === "Semua"
      ? orders
      : orders.filter((o) => statusLabel[o.status] === activeTab);

  return (
    <div className="mx-auto w-full max-w-[calc(100vw-3rem)] min-w-0 pb-[calc(1rem+env(safe-area-inset-bottom))] md:max-w-full">
      {/* Page heading */}
      <div className="mb-8 sm:mb-10">
        <div className="mb-1 flex items-center gap-4">
          {/* Back button — mobile only */}
          <div className="md:hidden">
            <Link
              href={`/dashboard/pelanggan/${nama}/profile`}
              aria-label="Kembali"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#191c1d] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e1e3e4] transition-colors hover:bg-[#f3f4f5] active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          </div>
          <h1
            className="text-[#191c1d] font-semibold tracking-tight text-2xl md:text-[36px]"
            style={{ lineHeight: "1.2", letterSpacing: "-0.02em" }}
          >
            Pesanan Saya
          </h1>
        </div>
        <p className="text-[#707974] text-sm md:text-base">
          Pantau status pesanan dan riwayat belanja Anda.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 max-w-full min-w-0 overflow-hidden border-b border-[#bfc9c3]">
        <div
          className="flex max-w-full min-w-0 gap-5 overflow-x-auto sm:gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#003527] text-[#003527]"
                  : "border-transparent text-[#707974] hover:text-[#003527]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
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
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} nama={nama} onExpired={() => setReloadKey((k) => k + 1)} />
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && !error && (
        <div className="mt-8 flex flex-col gap-3 border-t border-[#e1e3e4] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#707974]">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} dari {total} pesanan
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#bfc9c3] text-sm font-semibold text-[#404944] disabled:opacity-40 hover:bg-[#f3f4f5]"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-[#404944] font-semibold">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#bfc9c3] text-sm font-semibold text-[#404944] disabled:opacity-40 hover:bg-[#f3f4f5]"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
