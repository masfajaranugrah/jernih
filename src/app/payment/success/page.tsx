"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTokenSlug } from "@/lib/auth";

const POLL_INTERVAL = 5000;

type StatusResponse = {
  orderId?: string;
  orderNumber?: string;
  orderStatus?: string;
  paymentStatus?: string;
};

type OrderDetail = {
  id: string;
  orderNumber: string | null;
  total: string;
  subtotal: string;
  discountAmount: string;
  shippingCost: string;
  status: string;
};

type ViewState =
  | { kind: "loading" }
  | { kind: "missing-ref" }
  | { kind: "unauthorized" }
  | { kind: "notfound" }
  | { kind: "error"; message: string }
  | { kind: "ready"; status: StatusResponse; detail: OrderDetail | null };

function formatRupiah(value: string | number | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  return "Rp " + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
  PARTIALLY_REFUNDED: "Dikembalikan Sebagian",
  AMOUNT_MISMATCH: "Nominal Tidak Sesuai",
};

const ORDER_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  CONFIRMED: "Dikonfirmasi",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
  EXPIRED: "Kedaluwarsa",
};

/** Halaman Finish Redirect URL Midtrans — ambil status SELALU dari backend
 *  (source of truth), jangan pernah percaya query string sebagai indikator
 *  pembayaran berhasil. */
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  // order_id = param standar yang dikirim Midtrans saat redirect ke Finish
  // Redirect URL. Dukungan orderId/orderNumber/order tetap dipertahankan.
  const reference =
    searchParams.get("order_id") ??
    searchParams.get("orderId") ??
    searchParams.get("orderNumber") ??
    searchParams.get("order") ??
    "";

  const slug = getTokenSlug();

  async function fetchStatus(ref: string) {
    const res = await fetch(`/api/payments/${encodeURIComponent(ref)}/status`, {
      cache: "no-store",
    });
    if (res.status === 401) {
      setState({ kind: "unauthorized" });
      return null;
    }
    if (res.status === 404) {
      setState({ kind: "notfound" });
      return null;
    }
    const data = (await res.json().catch(() => ({}))) as StatusResponse &
      Partial<Record<"message", string | string[]>>;
    if (!res.ok) {
      const rawMessage = data.message;
      setState({
        kind: "error",
        message: Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage ?? "Terjadi kesalahan",
      });
      return null;
    }
    return data;
  }

  async function fetchDetail(orderId?: string) {
    if (!orderId) return null;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as OrderDetail;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!reference) {
        setState({ kind: "missing-ref" });
        return;
      }
      const status = await fetchStatus(reference);
      if (cancelled || !status) return;
      const detail = await fetchDetail(status.orderId);
      if (!cancelled) setState({ kind: "ready", status, detail });
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  // Saat status masih PENDING: polling status backend sampai berubah
  // (backend juga melakukan sync ke Midtrans jika webhook telat).
  useEffect(() => {
    if (state.kind !== "ready") return;
    if (state.status.paymentStatus !== "PENDING") return;
    const currentRef = reference;
    const timer = setInterval(async () => {
      const status = await fetchStatus(currentRef);
      if (status) {
        setState((prev) => (prev.kind === "ready" ? { ...prev, status } : prev));
      }
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [state, reference]);

  if (state.kind === "loading") return <ResultLoading />;

  if (state.kind === "missing-ref") {
    return (
      <ResultShell>
        <div className="text-5xl">ℹ️</div>
        <h1 className="mt-4 text-xl font-black text-neutral-900">Data Pesanan Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-gray-500">
          URL pembayaran tidak memuat nomor pesanan. Silakan buka dari halaman pesanan Anda.
        </p>
        <ResultActions showOrders={false} />
      </ResultShell>
    );
  }

  if (state.kind === "unauthorized") {
    return (
      <ResultShell>
        <div className="text-5xl">🔒</div>
        <h1 className="mt-4 text-xl font-black text-neutral-900">Silakan Masuk</h1>
        <p className="mt-2 text-sm text-gray-500">
          Anda perlu masuk untuk melihat status pesanan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/dashboard/pelanggan/login?from=${encodeURIComponent(`/payment/success?order_id=${encodeURIComponent(reference)}`)}`}
            className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
          >
            Masuk
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-neutral-700 transition hover:bg-gray-50"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </ResultShell>
    );
  }

  if (state.kind === "notfound" || state.kind === "error") {
    return (
      <ResultShell>
        <div className="text-5xl">❌</div>
        <h1 className="mt-4 text-xl font-black text-neutral-900">Pesanan Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-gray-500">
          {state.kind === "error" ? state.message : "Nomor pesanan tidak dikenali. Pastikan link yang Anda buka valid."}
        </p>
        <ResultActions showOrders={false} />
      </ResultShell>
    );
  }

  const { status, detail } = state;
  const paymentStatus = status.paymentStatus ?? "";
  const orderStatus = status.orderStatus ?? "";
  const orderNumber = status.orderNumber ?? detail?.orderNumber ?? "";
  const total = detail?.total;
  const ordersHref =
    status.orderId && slug
      ? `/dashboard/pelanggan/${slug}/orders/${status.orderId}`
      : null;

  const isPaid = paymentStatus === "PAID";
  const isPending = paymentStatus === "PENDING";
  const failedStatuses = ["FAILED", "EXPIRED", "CANCELLED", "AMOUNT_MISMATCH"];
  const isFailed = failedStatuses.includes(paymentStatus);

  if (isPaid) {
    return (
      <ResultShell>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9 text-green-600"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-black text-neutral-900">Pembayaran Berhasil</h1>
        <p className="mt-2 text-sm text-gray-500">
          Terima kasih, pembayaran Anda telah berhasil.
        </p>

        {orderNumber && (
          <div className="mt-6 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-xs text-gray-500">Nomor Pesanan</p>
              <p className="text-sm font-black text-gray-950">#{orderNumber}</p>
            </div>
            {total !== undefined && (
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <p className="text-xs text-gray-500">Total Pembayaran</p>
                <p className="text-sm font-black text-gray-950">{formatRupiah(total)}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-gray-500">Status Pesanan</p>
              <span className="rounded-full bg-[#064e3b]/10 px-3 py-1 text-xs font-bold text-[#064e3b]">
                {ORDER_LABEL[orderStatus] ?? orderStatus}
              </span>
            </div>
          </div>
        )}

        <ResultActions showOrders={!!ordersHref} ordersHref={ordersHref ?? undefined} />
      </ResultShell>
    );
  }

  if (isPending) {
    return (
      <ResultShell>
        <div className="flex flex-col items-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
          <h1 className="mt-4 text-xl font-black text-neutral-900">Pembayaran Sedang Diproses</h1>
          <p className="mt-2 text-sm text-gray-500">
            Kami sedang menunggu konfirmasi pembayaran. Halaman ini akan memperbarui status secara otomatis.
          </p>
        </div>

        {orderNumber && (
          <div className="mt-2 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="text-xs text-gray-500">Nomor Pesanan</p>
              <p className="text-sm font-black text-gray-950">#{orderNumber}</p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-gray-500">Status Pesanan</p>
              <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-bold text-[#93000a]">
                {PAYMENT_LABEL[paymentStatus] ?? "Menunggu Pembayaran"}
              </span>
            </div>
          </div>
        )}

        <ResultActions showOrders={!!ordersHref} ordersHref={ordersHref ?? undefined} />
      </ResultShell>
    );
  }

  if (isFailed) {
    const failedTitle: Record<string, string> = {
      FAILED: "Pembayaran Gagal",
      EXPIRED: "Pembayaran Kedaluwarsa",
      CANCELLED: "Pembayaran Dibatalkan",
      AMOUNT_MISMATCH: "Nominal Pembayaran Tidak Sesuai",
    };
    return (
      <ResultShell>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9 text-red-600"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-black text-neutral-900">
          {failedTitle[paymentStatus] ?? "Pembayaran Gagal"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {paymentStatus === "AMOUNT_MISMATCH"
            ? "Jumlah yang dibayarkan tidak sesuai. Tim kami akan meninjau transaksi Anda."
            : "Pembayaran Anda tidak berhasil diproses. Silakan coba lagi atau hubungi admin."}
        </p>

        {orderNumber && (
          <div className="mt-6 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Nomor Pesanan</p>
              <p className="text-sm font-black text-gray-950">#{orderNumber}</p>
            </div>
          </div>
        )}

        <ResultActions showOrders={!!ordersHref} ordersHref={ordersHref ?? undefined} />
      </ResultShell>
    );
  }

  // Payment REFUNDED / PARTIALLY_REFUNDED / status lain — tampilkan apa adanya.
  return (
    <ResultShell>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-500">
        ℹ️
      </div>
      <h1 className="mt-4 text-xl font-black text-neutral-900">Status Pembayaran</h1>
      <p className="mt-2 text-sm text-gray-500">
        {PAYMENT_LABEL[paymentStatus] ?? paymentStatus}
        {orderStatus ? ` — Pesanan: ${ORDER_LABEL[orderStatus] ?? orderStatus}` : ""}
      </p>
      <ResultActions showOrders={!!ordersHref} ordersHref={ordersHref ?? undefined} />
    </ResultShell>
  );
}

function ResultShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4 py-10 text-neutral-900">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ResultLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fb]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
    </div>
  );
}

function ResultActions({
  showOrders,
  ordersHref,
}: {
  showOrders: boolean;
  ordersHref?: string;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      {showOrders && ordersHref && (
        <Link
          href={ordersHref}
          className="inline-flex w-full items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
        >
          Lihat Pesanan
        </Link>
      )}
      <Link
        href="/"
        className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-neutral-700 transition hover:bg-gray-50"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}