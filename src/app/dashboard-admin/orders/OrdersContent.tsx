"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";

// ── Types ──────────────────────────────────────────────────────────────────────

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
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
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

// ── Constants ──────────────────────────────────────────────────────────────────

const TABS = [
  "Semua",
  "Belum Bayar",
  "Dikemas",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
] as const;

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

// Design-system aligned badge colours
const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  PENDING: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-400",
  },
  CONFIRMED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  PROCESSING: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  SHIPPED: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  DELIVERED: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  CANCELLED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
  REFUNDED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  CASH: "Tunai",
  CREDIT_CARD: "Kartu Kredit",
  QRIS: "QRIS",
  GOPAY: "GoPay",
  OVO: "OVO",
  DANA: "DANA",
};

// Summary card meta — colour info per category
const SUMMARY_CARDS = [
  {
    key: "total",
    label: "Total Pesanan",
    isRevenue: false,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    dotColor: "bg-blue-500",
    valueBg: "",
    valueText: "text-[#0F172A]",
  },
  {
    key: "totalRevenue",
    label: "Total Penjualan",
    isRevenue: true,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    dotColor: "bg-emerald-500",
    valueBg: "",
    valueText: "text-emerald-700",
  },
  {
    key: "pending",
    label: "Belum Bayar",
    isRevenue: false,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    dotColor: "bg-orange-400",
    valueBg: "",
    valueText: "text-orange-700",
  },
  {
    key: "dikemas",
    label: "Dikemas",
    isRevenue: false,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    dotColor: "bg-blue-500",
    valueBg: "",
    valueText: "text-blue-700",
  },
  {
    key: "dikirim",
    label: "Dikirim",
    isRevenue: false,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
        />
      </svg>
    ),
    dotColor: "bg-indigo-500",
    valueBg: "",
    valueText: "text-indigo-700",
  },
  {
    key: "selesai",
    label: "Selesai",
    isRevenue: false,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    dotColor: "bg-green-500",
    valueBg: "",
    valueText: "text-green-700",
  },
  {
    key: "dibatalkan",
    label: "Dibatalkan",
    isRevenue: false,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    dotColor: "bg-red-400",
    valueBg: "",
    valueText: "text-red-600",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp " + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status Badge Component ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? {
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OrdersContent() {
  const router = useRouter();

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats state — calculated from ALL loaded orders, supplemented by /api/admin/orders/stats if available
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  const PAGE_SIZE = 20;

  // Fetch stats from API endpoint, fall back gracefully
  useEffect(() => {
    adminApi<{
      total?: number;
      pending?: number;
      confirmed?: number;
      processing?: number;
      shipped?: number;
      delivered?: number;
      cancelled?: number;
      refunded?: number;
    }>("orders/stats")
      .then((res) => {
        if (res && typeof res === "object") {
          setStats({
            total: res.total ?? 0,
            pending: res.pending ?? 0,
            dikemas: (res.confirmed ?? 0) + (res.processing ?? 0),
            dikirim: res.shipped ?? 0,
            selesai: res.delivered ?? 0,
            dibatalkan: (res.cancelled ?? 0) + (res.refunded ?? 0),
          });
        }
      })
      .catch(() => {
        // Stats endpoint not available — will calculate from loaded orders below
        setStats(null);
      });
  }, []);

  // Fetch orders
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const status = STATUS_MAP[activeTab];
    adminApi<{
      data: Order[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`orders?status=${encodeURIComponent(status)}&page=${page}&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setOrders(data);
        setTotal(
          Array.isArray(res) ? data.length : (res?.meta?.total ?? data.length),
        );
        setTotalPages(Array.isArray(res) ? 1 : (res?.meta?.totalPages ?? 1));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, page]);

  // Derive stats from current orders when API stats not available
  const derivedStats = useMemo(() => {
    // Always calculate totalRevenue from loaded orders (sum of delivered orders)
    const totalRevenue = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

    if (stats) return { ...stats, totalRevenue };

    // Count from currently loaded orders (best effort — only current page)
    const counts = { total: 0, pending: 0, dikemas: 0, dikirim: 0, selesai: 0, dibatalkan: 0, totalRevenue };
    orders.forEach((o) => {
      counts.total += 1;
      if (o.status === "PENDING") counts.pending += 1;
      if (o.status === "CONFIRMED" || o.status === "PROCESSING") counts.dikemas += 1;
      if (o.status === "SHIPPED") counts.dikirim += 1;
      if (o.status === "DELIVERED") counts.selesai += 1;
      if (o.status === "CANCELLED" || o.status === "REFUNDED") counts.dibatalkan += 1;
    });
    return counts;
  }, [stats, orders]);

  // Client-side search filter
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const orderNum = (o.orderNumber ?? o.id).toLowerCase();
      const userName = o.user.name.toLowerCase();
      const userEmail = o.user.email.toLowerCase();
      const itemNames = o.items.map((i) => i.name.toLowerCase()).join(" ");
      return (
        orderNum.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q) ||
        itemNames.includes(q)
      );
    });
  }, [orders, searchQuery]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-3.5 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-7 w-7 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <div className="h-7 w-12 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
        {/* Skeleton tabs */}
        <div className="flex gap-0 border-b border-[#E2E8F0]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 pb-3 pt-1">
              <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
        {/* Skeleton search */}
        <div className="h-10 w-full rounded-lg bg-slate-200 animate-pulse" />
        {/* Skeleton table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="h-10 bg-[#F8FAFC] border-b border-[#E2E8F0]" />
          <div className="divide-y divide-[#E2E8F0]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-32 rounded bg-slate-200 animate-pulse flex-1" />
                <div className="h-4 w-28 rounded bg-slate-200 animate-pulse flex-1" />
                <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="h-7 w-14 rounded-lg bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mx-auto mb-4">
            <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-1">Gagal memuat pesanan</h3>
          <p className="text-sm text-slate-500 mb-5">{error}</p>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              const status = STATUS_MAP[activeTab];
              adminApi<{
                data: Order[];
                meta: { total: number; page: number; limit: number; totalPages: number };
              }>(`orders?status=${encodeURIComponent(status)}&page=${page}&limit=${PAGE_SIZE}`)
                .then((res) => {
                  const data = Array.isArray(res) ? res : (res?.data ?? []);
                  setOrders(data);
                  setTotal(Array.isArray(res) ? data.length : (res?.meta?.total ?? data.length));
                  setTotalPages(Array.isArray(res) ? 1 : (res?.meta?.totalPages ?? 1));
                })
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false));
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {SUMMARY_CARDS.map((card) => {
          const rawValue = (derivedStats as Record<string, number>)[card.key] ?? 0;
          return (
            <div
              key={card.key}
              className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-3.5 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 leading-tight">{card.label}</p>
                <span
                  className={`flex items-center justify-center h-7 w-7 rounded-full ${card.iconBg} ${card.iconColor} shrink-0`}
                >
                  {card.icon}
                </span>
              </div>
              {card.isRevenue ? (
                <p className={`text-sm font-bold ${card.valueText} leading-snug`}>
                  {formatRupiah(rawValue)}
                </p>
              ) : (
                <p className={`text-2xl font-bold ${card.valueText}`}>
                  {rawValue}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex overflow-x-auto gap-0 border-b border-[#E2E8F0]"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
              setSearchQuery("");
            }}
            className={`px-4 pb-3 pt-1 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-[#0F172A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari order ID, pelanggan, produk..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] placeholder-slate-400 text-[#0F172A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0 shadow-sm">
          <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filter
        </button>
      </div>

      {/* ── Empty State ── */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            className="h-14 w-14 text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-slate-500 text-sm font-medium">
            {searchQuery
              ? `Tidak ada pesanan yang cocok dengan "${searchQuery}"`
              : "Tidak ada pesanan di kategori ini."}
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table (md and up) ── */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Pelanggan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Pembayaran
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredOrders.map((order) => {
                    const displayNumber =
                      order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
                    const itemCount = order.items.reduce(
                      (sum, i) => sum + i.quantity,
                      0,
                    );
                    const firstItem = order.items[0];
                    const moreCount = order.items.length - 1;
                    const paymentLabel =
                      PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ??
                      order.paymentMethod ??
                      "—";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Order ID */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-[#0F172A] text-xs">
                            #{displayNumber}
                          </span>
                        </td>

                        {/* Tanggal */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Pelanggan */}
                        <td className="px-4 py-4 max-w-[160px]">
                          <p className="font-medium text-[#0F172A] truncate text-xs">
                            {order.user.name}
                          </p>
                          <p className="text-slate-400 truncate text-[11px]">
                            {order.user.email}
                          </p>
                        </td>

                        {/* Produk */}
                        <td className="px-4 py-4 max-w-[200px]">
                          {firstItem && (
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 shrink-0 rounded-md bg-slate-100 overflow-hidden">
                                {firstItem.product?.images?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={firstItem.product.images[0]}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                                    📦
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#0F172A] truncate">
                                  {firstItem.name}
                                </p>
                                {moreCount > 0 && (
                                  <p className="text-[11px] text-slate-400">
                                    +{moreCount} item lain • {itemCount} total
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span className="font-bold text-[#0F172A] text-sm">
                            {formatRupiah(order.total)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Pembayaran */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-600 font-medium">
                              {paymentLabel}
                            </span>
                            {order.paidAt ? (
                              <span className="text-[11px] text-green-600 font-medium">
                                ✓ Lunas
                              </span>
                            ) : (
                              <span className="text-[11px] text-orange-500 font-medium">
                                Belum dibayar
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard-admin/orders/${order.id}`,
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            Lihat
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards (below md) ── */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={() =>
                  router.push(`/dashboard-admin/orders/${order.id}`)
                }
              />
            ))}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
          <p className="text-xs text-slate-500">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} dari {total} pesanan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-600 font-semibold tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile Order Card ──────────────────────────────────────────────────────────

function OrderCard({
  order,
  onSelect,
}: {
  order: Order;
  onSelect: () => void;
}) {
  const displayNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const paymentLabel =
    PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ??
    order.paymentMethod ??
    "—";

  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#2563EB]/30 transition-all cursor-pointer group text-left w-full shadow-sm"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-[#0F172A] font-mono">
            #{displayNumber}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
        <svg
          className="h-3.5 w-3.5 shrink-0 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="truncate font-medium text-[#0F172A]">
          {order.user.name}
        </span>
        <span className="text-slate-300">•</span>
        <span className="truncate">{order.user.email}</span>
      </div>

      {/* Items preview */}
      <div className="space-y-1.5 mb-3">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="h-7 w-7 shrink-0 rounded-md bg-slate-100 overflow-hidden">
              {item.product?.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 text-xs">
                  📦
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#0F172A] truncate">
                {item.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {item.quantity} × {formatRupiah(item.price)}
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-[#2563EB] font-semibold">
            +{order.items.length - 2} item lainnya
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
        <div>
          <p className="text-[11px] text-slate-400">
            {itemCount} item • {paymentLabel}
          </p>
          <p className="text-base font-bold text-[#0F172A]">
            {formatRupiah(order.total)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors border border-blue-100">
          Lihat
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </button>
  );
}
