"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
  CART_EVENT,
} from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";
import { PAYMENT_METHODS, calculateFee, loadSnapScript, payWithSnap, type PaymentMethodId } from "@/lib/midtrans";

function formatPrice(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

type CreatedOrder = {
  id: string;
  orderNumber: string | null;
  total: string;
  subtotal: string;
  discountAmount: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    subtotal: string;
    product?: { images?: string[] } | null;
    service?: { images?: string[] } | null;
  }>;
};

export default function KeranjangPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step alur: 'cart' (ringkasan) | 'payment' (detail + pilih metode bayar)
  const [step, setStep] = useState<"cart" | "payment">("cart");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);

  // Alamat
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
    const sync = () => setItems(getCart());
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  // Muat alamat user (jika login) — pilih default otomatis
  useEffect(() => {
    let cancelled = false;
    fetch("/api/addresses", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Address[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedVoucher?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  // Voucher tidak lagi valid jika subtotal berubah — reset
  useEffect(() => {
    setAppliedVoucher(null);
    setVoucherError(null);
  }, [subtotal]);

  async function handleApplyVoucher() {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;
    setVoucherError(null);
    setVoucherChecking(true);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      if (res.status === 401) {
        router.push("/dashboard/pelanggan/login?from=/keranjang");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Voucher tidak valid"
        );
      }
      setAppliedVoucher({ code, discount: Number(data.discount) || 0 });
    } catch (e: unknown) {
      setAppliedVoucher(null);
      setVoucherError(e instanceof Error ? e.message : "Voucher tidak valid");
    } finally {
      setVoucherChecking(false);
    }
  }

  async function handleCheckout() {
    setError(null);

    // Wajib login dulu — arahkan ke halaman login pelanggan
    if (!user) {
      router.push("/dashboard/pelanggan/login?from=/keranjang");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
          ...(selectedAddressId ? { addressId: selectedAddressId } : {}),
          notes: notes.trim()
            ? notes.trim()
            : items.some((i) => i.typeName)
              ? items.filter((i) => i.typeName).map((i) => `${i.name}: ${i.typeName}`).join("; ")
              : undefined,
        }),
      });

      if (res.status === 401) {
        router.push("/dashboard/pelanggan/login?from=/keranjang");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal membuat pesanan"
        );
      }

      // Sukses — kosongkan keranjang & tampilkan step pembayaran
      clearCart();
      setCreatedOrder(data);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  }

  /** Buka Snap payment untuk metode terpilih */
  async function handlePay() {
    if (!createdOrder || !selectedMethod) return;
    setPayError(null);
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/payment-intent`, {
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
          Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal membuat pembayaran"
        );
      }

      await loadSnapScript();
      const ordersUrl = `/dashboard/pelanggan/${user?.slug ?? user?.name?.toLowerCase().replace(/\s+/g, "-") ?? ""}/orders`;
      payWithSnap(data.token, {
        onSuccess: () => router.push(ordersUrl),
        onPending: () => router.push(ordersUrl),
        onError: () => setPayError("Pembayaran gagal atau dibatalkan. Silakan coba lagi."),
      });
      // onClose (user menutup popup) → biarkan tetap di halaman agar bisa pilih metode lain
      setPaying(false);
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : "Terjadi kesalahan saat memproses pembayaran");
      setPaying(false);
    }
  }

  // ── Step pembayaran: detail pesanan (atas) + pilihan metode (bawah) ──
  if (step === "payment" && createdOrder) {
    const orderTotal = Number(createdOrder.total) || 0;
    const orderSubtotal = Number(createdOrder.subtotal) || 0;
    const orderDiscount = Number(createdOrder.discountAmount) || 0;
    const displayNumber = createdOrder.orderNumber ?? createdOrder.id.slice(0, 8).toUpperCase();

    // Fee admin utk metode yg dipilih (0 jika belum pilih)
    const selectedFee = selectedMethod ? calculateFee(selectedMethod, orderTotal) : 0;
    const amountToPay = orderTotal + selectedFee;

    const bankMethods = PAYMENT_METHODS.filter((m) => m.group === "Bank Transfer");
    const walletMethods = PAYMENT_METHODS.filter((m) => m.group === "E-Wallet / QRIS");

    return (
      <div className="min-h-screen bg-[#f8f9fb] text-neutral-900">
        <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition"
              aria-label="Kembali"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <h1 className="text-xl font-black text-neutral-900">Pilih Metode Pembayaran</h1>
          </div>

          {/* ── Detail Pesanan (atas) ── */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs text-gray-500">Nomor Pesanan</p>
                <p className="text-sm font-black text-gray-950">#{displayNumber}</p>
              </div>
              <span className="rounded-full bg-[#064e3b]/10 px-3 py-1 text-xs font-bold text-[#064e3b]">
                Menunggu Pembayaran
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {createdOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {item.product?.images?.[0] || item.service?.images?.[0] ? (
                      <img
                        src={(item.product?.images?.[0] ?? item.service?.images?.[0])!}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg text-gray-300">📦</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-950">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x {formatPrice(Number(item.price))}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-950">{formatPrice(Number(item.subtotal))}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-950">{formatPrice(orderSubtotal)}</span>
              </div>
              {orderDiscount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Potongan voucher</span>
                  <span className="font-bold text-green-700">-{formatPrice(orderDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-950">
                <span>Total Bayar</span>
                <span className="text-lg font-black">{formatPrice(amountToPay)}</span>
              </div>
            </div>
          </div>

          {/* ── Pilihan Metode Bayar (bawah) ── */}
          <div className="mt-5 space-y-5">
            <div>
              <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-500">Bank Transfer</h2>
              <div className="space-y-2">
                {bankMethods.map((m) => (
                  <PaymentOption
                    key={m.id}
                    label={m.label}
                    desc={m.desc}
                    active={selectedMethod === m.id}
                    onClick={() => setSelectedMethod(m.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-500">E-Wallet / QRIS</h2>
              <div className="space-y-2">
                {walletMethods.map((m) => (
                  <PaymentOption
                    key={m.id}
                    label={m.label}
                    desc={m.desc}
                    active={selectedMethod === m.id}
                    onClick={() => setSelectedMethod(m.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {payError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {payError}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!selectedMethod || paying}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying ? "Memproses..." : selectedMethod ? "Bayar Sekarang" : "Pilih Metode Pembayaran"}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Anda akan diarahkan ke halaman pembayaran yang aman untuk menyelesaikan transaksi.
          </p>
        </main>
      </div>
    );
  }

  // ── Step cart: ringkasan belanja (default) ──
  return (
    <div className="min-h-screen bg-[#f8f9fb] text-neutral-900">
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <h1 className="text-2xl font-black text-neutral-900">Keranjang Belanja</h1>

        {!mounted ? null : items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <svg className="h-16 w-16 fill-current text-gray-300" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2ZM1 2v2h2l3.6 7.6-1.4 2.4c-.7 1.3.3 3 1.8 3h12v-2H7l1.1-2h7.4c.8 0 1.4-.4 1.8-1l3.6-6.5c.4-.7-.1-1.5-.9-1.5H5.2L4.3 2H1Zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z" />
            </svg>
            <p className="mt-4 text-gray-500">Keranjang Anda masih kosong.</p>
            <Link
              href="/produk"
              className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Daftar item */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.typeName ?? ""}`}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <Link href={`/produk/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/produk/${item.slug}`} className="line-clamp-2 text-sm font-bold text-gray-950 hover:text-neutral-900">
                      {item.name}
                    </Link>
                    {item.typeName && (
                      <p className="mt-0.5 text-xs text-gray-500">Tipe: {item.typeName}</p>
                    )}
                    <p className="mt-1 text-sm font-black text-gray-950">{formatPrice(item.price)}</p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex w-24 items-center rounded-lg border border-gray-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.typeName ?? null, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900"
                          aria-label="Kurangi"
                        >
                          −
                        </button>
                        <span className="w-full text-center text-sm font-bold text-gray-950">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.typeName ?? null, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900"
                          aria-label="Tambah"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.typeName ?? null)}
                        className="text-xs font-bold text-[#dc2626] hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black text-gray-950">Ringkasan Belanja</h2>

                {/* Alamat pengiriman */}
                {addresses.length > 0 && (
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-bold text-gray-700" htmlFor="order-address">
                      Alamat Pengiriman
                    </label>
                    <select
                      id="order-address"
                      value={selectedAddressId ?? ""}
                      onChange={(e) => setSelectedAddressId(e.target.value || null)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} — {a.recipient}, {a.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Voucher */}
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-bold text-gray-700" htmlFor="voucher-code">
                    Kode Voucher
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="voucher-code"
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode"
                      disabled={!!appliedVoucher}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase tracking-wider outline-none focus:border-neutral-900 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    {appliedVoucher ? (
                      <button
                        type="button"
                        onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }}
                        className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                      >
                        Batal
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={voucherChecking || !voucherCode.trim()}
                        className="shrink-0 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white hover:bg-neutral-800 disabled:opacity-50"
                      >
                        {voucherChecking ? "..." : "Pakai"}
                      </button>
                    )}
                  </div>
                  {voucherError && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">{voucherError}</p>
                  )}
                  {appliedVoucher && (
                    <p className="mt-1.5 text-xs font-semibold text-green-700">
                      Voucher {appliedVoucher.code} dipakai — hemat {formatPrice(appliedVoucher.discount)}
                    </p>
                  )}
                </div>

                {/* Rincian */}
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                    <span className="font-bold text-gray-950">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Potongan voucher</span>
                      <span className="font-bold text-green-700">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="font-bold text-gray-950">Total</span>
                    <span className="text-lg font-black text-gray-950">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-bold text-gray-700" htmlFor="order-notes">
                    Catatan (opsional)
                  </label>
                  <textarea
                    id="order-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan untuk penjual..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  />
                </div>

                {error && (
                  <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-black text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Memproses..." : "Buat Pesanan"}
                </button>
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  Setelah pesanan dibuat, Anda akan memilih metode pembayaran.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

/** Opsi metode pembayaran yang bisa dipilih */
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
      className={`flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left transition ${
        active ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-black" : "border-gray-300"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-black" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-gray-950">{label}</span>
        <span className="block text-xs text-gray-500">{desc}</span>
      </span>
    </button>
  );
}
