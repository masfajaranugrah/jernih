"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  replaceCart,
  type CartItem,
  CART_EVENT,
} from "@/lib/cart";
import { getProductPricing, type ApiProduct } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { getTokenSlug } from "@/lib/auth";
import { resolveImageUrl } from "@/lib/image-url";
import { PAYMENT_METHODS, calculateFee, loadSnapScript, payWithSnap, type PaymentMethodId } from "@/lib/midtrans";
import { COURIERS, formatEtd, formatWeightKg, preferNonCargo, type ShippingOption } from "@/lib/shipping";

const PAYMENT_DRAFT_KEY = "mh_payment_draft";

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
  district?: string | null;
  isDefault: boolean;
};

type CreatedOrder = {
  id: string;
  orderNumber: string | null;
  total: string;
  subtotal: string;
  discountAmount: string;
  shippingDiscount: string;
  shippingCost: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    subtotal: string;
    product?: { images?: string[] } | null;
    service?: { images?: string[] } | null;
  }>;
  orderVouchers?: Array<{
    id: string;
    voucherCode: string;
    voucherCategory: "DISCOUNT" | "SHIPPING";
    discountAmount: string;
    voucher?: {
      code: string;
      name: string | null;
      description: string | null;
      category: "DISCOUNT" | "SHIPPING";
    } | null;
  }>;
};

type AvailableVoucher = {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  category: "DISCOUNT" | "SHIPPING";
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minPurchase: string;
  maxDiscount: string | null;
  used: boolean;
};

type PaymentDraft = {
  createdOrder: CreatedOrder;
  selectedAddressId: string | null;
  selectedMethod: PaymentMethodId | null;
  notes: string;
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

  // Voucher di step pembayaran (DISCOUNT produk & SHIPPING ongkir)
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<AvailableVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [voucherBusy, setVoucherBusy] = useState<string | null>(null);
  const [voucherApplyError, setVoucherApplyError] = useState<string | null>(null);

  // Idempotency key untuk checkout — diisi saat checkout pertama kali (event handler)
  const sessionIdRef = useRef<string | null>(null);
  // Beli Sekarang → ?step=payment tanpa draft → checkout otomatis (buat order, langsung ke step bayar)
  const autoCheckoutPending = useRef(false);
  const autoCheckoutStarted = useRef(false);
  // Seleksi alamat otomatis sudah selesai diputuskan (sebelum auto-checkout)
  const addressSelectionSettled = useRef(false);
  // Refs agar alamat terpilih bisa dibaca aman dari efek async (bukan stale closure)
  const selectedAddressIdRef = useRef<string | null>(null);

  // Alamat
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  useEffect(() => {
    selectedAddressIdRef.current = selectedAddressId;
  }, [selectedAddressId]);
  // Alamat yang baru dibuat (dari redirect halaman alamat) — dipilih otomatis
  const pendingAddrRef = useRef<string | null>(null);

  // Ongkir (RajaOngkir via backend)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingSearch, setShippingSearch] = useState("");
  const [shippingReloadKey, setShippingReloadKey] = useState(0);
  // Berat total dari backend (satu-satunya sumber — jangan hitung ulang di frontend)
  const [shippingTotalWeightKg, setShippingTotalWeightKg] = useState<number | null>(null);
  // Notifikasi perubahan harga promo/expired pada item keranjang
  const [priceNotices, setPriceNotices] = useState<Record<string, string>>({});

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
    const sync = () => setItems(getCart());
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  // Restore draft checkout ketika kembali dari halaman alamat (?step=payment) atau refresh
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const addr = params.get("addr");
      if (addr) pendingAddrRef.current = addr;
      if (params.get("step") !== "payment") return;

      const raw = sessionStorage.getItem(PAYMENT_DRAFT_KEY);
      if (raw) {
        const draft: PaymentDraft | null = JSON.parse(raw);
        if (draft?.createdOrder?.id) {
          setCreatedOrder(draft.createdOrder);
          setStep("payment");
          if (draft.selectedAddressId) setSelectedAddressId(draft.selectedAddressId);
          if (draft.selectedMethod) setSelectedMethod(draft.selectedMethod);
          if (draft.notes) setNotes(draft.notes);
          // Segarkan data order dari server (mis. image produk) — draft lama bisa
          // menyimpan snapshot tanpa relasi product sehingga gambar tidak muncul.
          fetch(`/api/orders/${draft.createdOrder.id}`, { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((fresh) => {
              if (fresh?.id && Array.isArray(fresh.items)) setCreatedOrder(fresh);
            })
            .catch(() => {});
          return;
        }
      }
      // Beli Sekarang (atau URL ?step=payment) tanpa draft valid → buat order lalu step bayar
      autoCheckoutPending.current = true;
    } catch {
      autoCheckoutPending.current = true;
    }
  }, []);

  // Auto-checkout untuk alur Beli Sekarang: tunggu alamat diputuskan lalu buat order
  useEffect(() => {
    if (!autoCheckoutPending.current || autoCheckoutStarted.current) return;
    if (step !== "cart" || createdOrder || !mounted || !items.length || addressesLoading) return;
    if (!addressSelectionSettled.current) return;
    autoCheckoutStarted.current = true;
    void startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createdOrder, mounted, items, addressesLoading, selectedAddressId]);

  // Muat alamat user (jika login)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/addresses", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Address[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setAddresses(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Aturan pemilihan alamat:
  // 0 alamat → wajib tambah | 1 alamat → auto select | >1 + default → default
  // >1 tanpa default → tampilkan pilihan (tidak auto select)
  useEffect(() => {
    addressSelectionSettled.current = true;
    if (!addresses.length) {
      setSelectedAddressId(null);
      return;
    }
    // Alamat baru dibuat (redirect dari halaman alamat) → pilih langsung
    if (pendingAddrRef.current) {
      const match = addresses.find((a) => a.id === pendingAddrRef.current);
      pendingAddrRef.current = null;
      if (match) {
        setSelectedAddressId(match.id);
        return;
      }
    }
    // Seleksi yang sudah valid → pertahankan (biar ongkir tidak hitung ulang sia-sia)
    if (selectedAddressId && addresses.some((a) => a.id === selectedAddressId)) {
      return;
    }
    if (addresses.length === 1) {
      setSelectedAddressId(addresses[0].id);
      return;
    }
    const def = addresses.find((a) => a.isDefault);
    if (def) {
      setSelectedAddressId(def.id);
      return;
    }
    setSelectedAddressId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  // Auto hitung ongkir — jalankan otomatis setiap alamat berubah
  useEffect(() => {
    if (step !== "payment" || !selectedAddressId) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setShippingCost(0);
      setShippingTotalWeightKg(null);
      setShippingLoading(false);
      setShippingError(null);
      return;
    }
    let cancelled = false;
    setShippingLoading(true);
    setShippingError(null);
    // Hapus ongkir lama dulu — jangan pertahankan ongkir dari alamat sebelumnya
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingCost(0);
    setShippingTotalWeightKg(null);

    fetch("/api/shipping/cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId: selectedAddressId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(
            Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal menghitung ongkir"
          );
        }
        return data;
      })
      .then((data) => {
        if (cancelled || !data) return;
        const options: ShippingOption[] = Array.isArray(data.options) ? data.options : [];
        setShippingOptions(options);
        setShippingTotalWeightKg(Number(data.totalWeightKg) || null);
        // Auto-select: utamakan paket reguler, jangan otomatis memilih cargo/trucking
        const initial = preferNonCargo(options);
        if (initial) {
          setSelectedShipping(initial);
          setShippingCost(Number(initial.cost) || 0);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setShippingError(e instanceof Error ? e.message : "Gagal menghitung biaya pengiriman.");
        }
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });

    return () => { cancelled = true; };
  }, [step, selectedAddressId, shippingReloadKey]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedVoucher?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  // ── Validasi ulang harga promo ─────────────────────────────────────────
  // Snapshot harga disimpan saat add-to-cart. Jika promo berakhir/habis atau
  // harga berubah, perbarui harga yang ditampilkan dan beri tahu pelanggan.
  useEffect(() => {
    if (!mounted || items.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
        const res = await fetch(`${API}/products?limit=100`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const list: ApiProduct[] = Array.isArray(json.data) ? json.data : [];
        const map = new Map(list.map((p) => [p.id, p]));

        const notices: Record<string, string> = {};
        let changed = false;
        const next = items.map((item) => {
          const fresh = map.get(item.productId);
          if (!fresh) return item;
          const { displayPrice, promo } = getProductPricing(fresh);
          const current = Math.round(displayPrice);
          if (current === item.price) return item;
          changed = true;
          const key = `${item.productId}:${item.typeName ?? ""}`;
          if (promo) {
            notices[key] = `Harga promo ${promo.title} diperbarui menjadi Rp${current.toLocaleString("id-ID")}.`;
          } else if (item.promoEndsAt) {
            notices[key] = "Promo telah berakhir. Harga dikembalikan ke harga normal.";
          } else {
            notices[key] = `Harga produk diperbarui menjadi Rp${current.toLocaleString("id-ID")}.`;
          }
          return {
            ...item,
            price: current,
            basePrice: promo ? Number(fresh.price) : item.basePrice,
            promoEndsAt: promo?.endsAt ?? null,
            promoTitle: promo?.title ?? null,
          };
        });
        if (changed && !cancelled) {
          setPriceNotices(notices);
          setItems(next);
          replaceCart(next);
        }
      } catch {
        /* abaikan — harga snapshot tetap dipakai */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, items.length]);

  const slug = getTokenSlug() ?? (user?.name ? user.name.toLowerCase().replace(/\s+/g, "-") : "user");
  const addAddressHref = `/dashboard/pelanggan/${slug}/addresses?from=${encodeURIComponent(
    step === "payment" ? "/keranjang?step=payment" : "/keranjang"
  )}`;

  // Voucher tidak lagi valid jika subtotal berubah — reset
  useEffect(() => {
    setAppliedVoucher(null);
    setVoucherError(null);
  }, [subtotal]);

  // Simpan draft checkout agar bisa lanjut setelah menambah alamat / refresh
  useEffect(() => {
    if (step === "payment" && createdOrder) {
      try {
        const draft: PaymentDraft = {
          createdOrder,
          selectedAddressId,
          selectedMethod,
          notes,
        };
        sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // sessionStorage tidak tersedia — abaikan
      }
    }
  }, [step, createdOrder, selectedAddressId, selectedMethod, notes]);

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

  /** Buka modal voucher step pembayaran — ambil daftar voucher aktif utk user */
  async function openVoucherModal() {
    setVoucherApplyError(null);
    setVoucherModalOpen(true);
    if (availableVouchers.length) return;
    setVouchersLoading(true);
    try {
      const res = await fetch("/api/vouchers");
      if (res.status === 401) {
        router.push("/dashboard/pelanggan/login?from=/keranjang");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Gagal memuat voucher");
      setAvailableVouchers(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      setAvailableVouchers([]);
    } finally {
      setVouchersLoading(false);
    }
  }

  /** Terapkan voucher ke order — POST /api/orders/:id/vouchers */
  async function handleApplyOrderVoucher(v: AvailableVoucher) {
    if (!createdOrder) return;
    setVoucherBusy(v.code);
    setVoucherApplyError(null);
    try {
      // Pastikan ongkir sudah tersimpan di backend sebelum hitung diskon ongkir
      // (voucher SHIPPING dihitung dari shippingCost order di DB, bukan dari UI).
      if (selectedAddressIdRef.current && selectedShipping) {
        const ship = await persistSelectedShipping();
        if (ship === null) return; // 401 → sudah redirect
      }
      const res = await fetch(`/api/orders/${createdOrder.id}/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherCode: v.code }),
      });
      if (res.status === 401) {
        router.push("/dashboard/pelanggan/login?from=/keranjang");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setVoucherApplyError(data?.message ?? "Voucher tidak dapat digunakan");
        return;
      }
      setCreatedOrder(data);
      setVoucherModalOpen(false);
    } catch (e: unknown) {
      setVoucherApplyError(e instanceof Error ? e.message : "Terjadi kesalahan saat memakai voucher");
    } finally {
      setVoucherBusy(null);
    }
  }

  /** Hapus voucher dari order — DELETE /api/orders/:id/vouchers/:voucherId */
  async function handleRemoveOrderVoucher(orderVoucherId: string) {
    if (!createdOrder) return;
    setVoucherBusy(orderVoucherId);
    setVoucherApplyError(null);
    try {
      const res = await fetch(
        `/api/orders/${createdOrder.id}/vouchers/${orderVoucherId}`,
        { method: "DELETE" },
      );
      if (res.status === 401) {
        router.push("/dashboard/pelanggan/login?from=/keranjang");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setVoucherApplyError(data?.message ?? "Gagal menghapus voucher");
        return;
      }
      setCreatedOrder(data);
    } catch {
      setVoucherApplyError("Terjadi kesalahan saat menghapus voucher");
    } finally {
      setVoucherBusy(null);
    }
  }

  /** Buat order (POST /api/orders) lalu lanjut ke step pembayaran. Dipakai tombol
   *  "Buat Pesanan" dan auto-checkout alur Beli Sekarang. */
  async function startCheckout() {
    setError(null);

    // Wajib login dulu — arahkan ke halaman login pelanggan
    if (!user) {
      router.push("/dashboard/pelanggan/login?from=/keranjang");
      return;
    }

    setSubmitting(true);
    try {
      // Idempotency key — mencegah order ganda akibat double-click / retry.
      // Key konsisten untuk satu sesi checkout (dihasilkan sekali per komponen).
      let idempotencyKey = sessionIdRef.current;
      if (!idempotencyKey) {
        idempotencyKey =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `co_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        sessionIdRef.current = idempotencyKey;
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
          ...(selectedAddressIdRef.current ? { addressId: selectedAddressIdRef.current } : {}),
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

  function handleCheckout() {
    void startCheckout();
  }

  /** Simpan pilihan pengiriman ke backend (hitung ulang ongkir + diskon ongkir).
   *  Backend adalah sumber kebenaran: shippingCost divalidasi ulang via RajaOngkir.
   *  Return order row saat sukses, null saat 401 (sudah redirect), throw saat error. */
  async function persistSelectedShipping(option?: ShippingOption) {
    const sel = option ?? selectedShipping;
    if (!createdOrder || !selectedAddressIdRef.current || !sel) return null;
    const res = await fetch(`/api/orders/${createdOrder.id}/shipping`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddressIdRef.current,
        courier: sel.code,
        service: sel.service,
      }),
    });
    if (res.status === 401) {
      router.push("/dashboard/pelanggan/login?from=/keranjang");
      return null;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal menyimpan pengiriman"
      );
    }
    // Backend bisa menghitung ulang ongkir & diskon ongkir — sinkronkan angka
    // total lokal tanpa menghilangkan relasi items/orderVouchers utk tampilan.
    setCreatedOrder((prev) =>
      prev
        ? {
            ...prev,
            subtotal: data.subtotal ?? prev.subtotal,
            discountAmount: data.discountAmount ?? prev.discountAmount,
            shippingDiscount: data.shippingDiscount ?? prev.shippingDiscount,
            shippingCost: data.shippingCost ?? prev.shippingCost,
            total: data.total ?? prev.total,
          }
        : prev
    );
    return data;
  }

  /** Simpan pengiriman lalu buka Snap payment untuk metode terpilih */
  async function handlePay() {
    if (!createdOrder || !selectedMethod) return;
    if (selectedAddressId && !selectedShipping) return;
    setPayError(null);
    setPaying(true);
    try {
      // 1) Simpan pilihan pengiriman — backend hitung ulang ongkir + snapshot alamat
      if (selectedAddressId && selectedShipping) {
        const ship = await persistSelectedShipping();
        if (ship === null) return; // 401 → sudah redirect
      }

      // 2) Buat payment-intent Midtrans
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
      const resultUrl = `/payment/success?order_id=${encodeURIComponent(createdOrder.orderNumber ?? createdOrder.id)}`;
      payWithSnap(data.token, {
        onSuccess: () => {
          sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
          router.push(resultUrl);
        },
        onPending: () => {
          sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
          router.push(resultUrl);
        },
        onError: () => setPayError("Pembayaran gagal atau dibatalkan. Silakan coba lagi."),
      });
      // onClose (user menutup popup) → biarkan tetap di halaman agar bisa pilih metode lain
      setPaying(false);
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : "Terjadi kesalahan saat memproses pembayaran");
      setPaying(false);
    }
  }

  function handleSelectShipping(option: ShippingOption) {
    setSelectedShipping(option);
    setShippingCost(Number(option.cost) || 0);
    setShippingModalOpen(false);
    // Persist agar diskon ongkir (voucher SHIPPING) langsung terhitung terhadap
    // ongkir yang dipilih — backend hitung ulang & sinkronkan shippingDiscount.
    if (step === "payment" && createdOrder && selectedAddressIdRef.current) {
      persistSelectedShipping(option).catch(() => {});
    }
  }

  function handleSelectPayment(m: (typeof PAYMENT_METHODS)[number]) {
    setSelectedMethod(m.id);
    setPaymentModalOpen(false);
  }

  // ── Step pembayaran: alamat + ongkir + ringkasan + metode bayar ──
  if (step === "payment" && createdOrder) {
    const orderSubtotal = Number(createdOrder.subtotal) || 0;
    const orderDiscount = Number(createdOrder.discountAmount) || 0;
    const orderShippingDiscount = Number(createdOrder.shippingDiscount) || 0;
    const orderTotal = Math.max(0, orderSubtotal - orderDiscount + shippingCost - orderShippingDiscount);
    const appliedOrderVouchers = createdOrder.orderVouchers ?? [];

    // Fee admin utk metode yg dipilih (0 jika belum pilih)
    const selectedFee = selectedMethod ? calculateFee(selectedMethod, orderTotal) : 0;
    const amountToPay = orderTotal + selectedFee;

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

    const bankMethods = PAYMENT_METHODS.filter((m) => m.group === "Bank Transfer");
    const walletMethods = PAYMENT_METHODS.filter((m) => m.group === "E-Wallet / QRIS");
    const selectedMethodObj = selectedMethod ? PAYMENT_METHODS.find((m) => m.id === selectedMethod) ?? null : null;

    const canPay =
      !!selectedMethod &&
      !!selectedAddress &&
      !shippingLoading &&
      !!selectedShipping &&
      !paying;

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

          {/* ── Ringkasan Pesanan ── */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="divide-y divide-gray-100">
              {createdOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {item.product?.images?.[0] || item.service?.images?.[0] ? (
                      <img
                        src={resolveImageUrl(item.product?.images?.[0] ?? item.service?.images?.[0])}
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
                  <span>Diskon Produk</span>
                  <span className="font-bold text-green-700">-{formatPrice(orderDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Ongkir</span>
                <span className="font-bold text-gray-950">
                  {shippingLoading ? "..." : selectedShipping ? formatPrice(shippingCost) : "—"}
                </span>
              </div>
              {orderShippingDiscount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Diskon Ongkir</span>
                  <span className="font-bold text-green-700">-{formatPrice(orderShippingDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-950">
                <span>Total Bayar</span>
                <span className="text-lg font-black">{formatPrice(amountToPay)}</span>
              </div>
            </div>
          </div>

          {/* ── Alamat Pengiriman ── */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-gray-950">Alamat Pengiriman</h2>

            {addressesLoading ? (
              <p className="mt-3 text-xs text-gray-400">Memuat alamat...</p>
            ) : addresses.length === 0 ? (
              <div className="mt-3 text-sm">
                <p className="text-gray-600">Anda belum memiliki alamat pengiriman.</p>
                <p className="mt-1 text-xs text-gray-500">
                  Silakan lengkapi alamat terlebih dahulu untuk melanjutkan pembayaran.
                </p>
                <Link
                  href={addAddressHref}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  Tambah Alamat
                </Link>
              </div>
            ) : (
              <div className="mt-3">
                {selectedAddress ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                    <p className="font-bold text-gray-950">
                      {selectedAddress.label}
                      {selectedAddress.isDefault && (
                        <span className="ml-2 rounded-full bg-[#064e3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#064e3b]">
                          Utama
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-gray-700">{selectedAddress.recipient}</p>
                    <p className="text-xs text-gray-500">{selectedAddress.phone}</p>
                    <p className="mt-1 text-gray-700">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province}{" "}
                      {selectedAddress.postalCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Pilih alamat pengiriman di bawah.</p>
                )}

                {addresses.length > 1 && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-bold text-gray-700" htmlFor="payment-address">
                      Ganti Alamat
                    </label>
                    <select
                      id="payment-address"
                      value={selectedAddressId ?? ""}
                      onChange={(e) => setSelectedAddressId(e.target.value || null)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
                    >
                      {!selectedAddressId && <option value="">Pilih alamat...</option>}
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} — {a.recipient}, {a.city}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Mengganti alamat akan menghitung ulang biaya pengiriman secara otomatis.
                    </p>
                  </div>
                )}

                {addresses.length === 1 && (
                  <Link
                    href={addAddressHref}
                    className="mt-3 inline-block text-xs font-bold text-neutral-900 underline"
                  >
                    + Tambah Alamat
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Pengiriman ── */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setShippingModalOpen(true)}
              disabled={shippingLoading || !selectedAddress || shippingOptions.length === 0 || !!shippingError}
              className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed"
            >
              <span className="text-xl" aria-hidden>🚚</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-gray-950">Pengiriman</span>
                {shippingLoading ? (
                  <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
                    Menghitung ongkir...
                  </span>
                ) : shippingError ? (
                  <span className="mt-1 block text-xs font-semibold text-red-600">Gagal menghitung biaya pengiriman.</span>
                ) : selectedShipping ? (
                  <>
                    <span className="mt-1 block text-sm font-bold text-gray-950">
                      {selectedShipping.name} {selectedShipping.service}
                    </span>
                    <span className="block text-xs text-gray-500">
                      Estimasi {formatEtd(selectedShipping.etd)} · {formatPrice(shippingCost)}
                    </span>
                  </>
                ) : (
                  <span className="mt-1 block text-sm text-gray-500">Pilih layanan pengiriman</span>
                )}
                {shippingTotalWeightKg != null && (
                  <span className="mt-1 block text-[11px] text-gray-400">
                    Berat Barang: {formatWeightKg(shippingTotalWeightKg)}
                  </span>
                )}
              </span>
              <span className="text-lg text-gray-400">›</span>
            </button>
          </div>

          {/* ── Voucher ── */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={openVoucherModal}
              disabled={voucherBusy !== null}
              className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed"
            >
              <span className="text-xl" aria-hidden>🎟</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-gray-950">Voucher</span>
                {appliedOrderVouchers.length > 0 ? (
                  appliedOrderVouchers.map((ov) => (
                    <span key={ov.id} className="mt-1 block text-sm font-bold text-[#064e3b]">
                      {ov.voucher?.name ?? ov.voucherCode} · Hemat {formatPrice(Number(ov.discountAmount) || 0)}
                    </span>
                  ))
                ) : (
                  <span className="mt-1 block text-sm text-gray-500">Tambahkan Voucher</span>
                )}
              </span>
              <span className="text-lg text-gray-400">›</span>
            </button>
            {voucherApplyError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{voucherApplyError}</p>
            )}
          </div>

          {/* ── Metode Pembayaran ── */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(true)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="text-xl" aria-hidden>💳</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-gray-950">Metode Pembayaran</span>
                {selectedMethodObj ? (
                  <>
                    <span className="mt-1 block text-sm font-bold text-gray-950">{selectedMethodObj.label}</span>
                    <span className="block text-xs text-gray-500">{selectedMethodObj.desc}</span>
                  </>
                ) : (
                  <span className="mt-1 block text-sm text-gray-500">Pilih metode pembayaran</span>
                )}
              </span>
              <span className="text-lg text-gray-400">›</span>
            </button>
          </div>

          {payError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {payError}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!canPay}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying
              ? "Memproses..."
              : shippingLoading
                ? "Menghitung Ongkir..."
                : selectedMethod
                  ? "Bayar Sekarang"
                  : "Pilih Metode Pembayaran"}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Anda akan diarahkan ke halaman pembayaran yang aman untuk menyelesaikan transaksi.
          </p>
        </main>

        {/* ── Modal pilih voucher ── */}
        <Modal open={voucherModalOpen} onClose={() => setVoucherModalOpen(false)} title="Pilih Voucher">
          {vouchersLoading ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
              Memuat voucher...
            </p>
          ) : (
            <div className="space-y-5">
              {appliedOrderVouchers.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-400">Voucher Dipakai</p>
                  <div className="space-y-2">
                    {appliedOrderVouchers.map((ov) => (
                      <div
                        key={ov.id}
                        className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#064e3b]">
                            {ov.voucher?.name ?? ov.voucherCode}
                            <span className="ml-2 rounded-full bg-[#064e3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#064e3b]">
                              {ov.voucherCategory === "SHIPPING" ? "Diskon Ongkir" : "Diskon Produk"}
                            </span>
                          </p>
                          <p className="text-xs font-semibold text-green-700">
                            Hemat {formatPrice(Number(ov.discountAmount) || 0)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOrderVoucher(ov.id)}
                          disabled={voucherBusy !== null}
                          className="ml-3 shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {voucherBusy === ov.id ? "..." : "Hapus"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableVouchers.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada voucher yang tersedia untuk Anda.</p>
              ) : (
                <div className="space-y-5">
                  {(() => {
                    const discount = availableVouchers.filter((v) => v.category === "DISCOUNT");
                    const shipping = availableVouchers.filter((v) => v.category === "SHIPPING");
                    const groups: Array<{ title: string; vouchers: AvailableVoucher[] }> = [
                      ...(discount.length ? [{ title: "Diskon Produk", vouchers: discount }] : []),
                      ...(shipping.length ? [{ title: "Potongan Ongkir", vouchers: shipping }] : []),
                    ];
                    return groups.map((g) => (
                      <div key={g.title}>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-400">{g.title}</p>
                        <div className="space-y-2.5">
                          {g.vouchers.map((v) => {
                            const categoryUsed = appliedOrderVouchers.some(
                              (ov) => ov.voucherCategory === v.category,
                            );
                            const disabled = v.used || categoryUsed;
                            return (
                              <div
                                key={v.id}
                                className={`rounded-xl border p-3.5 ${
                                  disabled ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-black text-gray-950">
                                      {v.name ?? v.code}
                                      <span className="rounded-full bg-[#064e3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#064e3b]">
                                        {v.category === "SHIPPING" ? "Potongan Ongkir" : "Diskon Produk"}
                                      </span>
                                    </p>
                                    {v.description && (
                                      <p className="mt-0.5 text-xs text-gray-500">{v.description}</p>
                                    )}
                                  </div>
                                  {disabled ? (
                                    <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-black text-gray-400">
                                      {v.used ? "✓ Digunakan" : "Terpakai"}
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={voucherBusy !== null}
                                      onClick={() => handleApplyOrderVoucher(v)}
                                      className="shrink-0 rounded-lg bg-[#064e3b] px-3 py-1.5 text-xs font-black text-white transition hover:bg-[#065f46] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {voucherBusy === v.code ? "..." : "Gunakan ›"}
                                    </button>
                                  )}
                                </div>
                                {disabled && (
                                  <p className="mt-1.5 text-[11px] font-semibold text-gray-400">
                                    {v.used
                                      ? "Voucher sudah pernah digunakan."
                                      : "Anda sudah menggunakan voucher kategori ini. Maksimal 1 voucher diskon."}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* ── Modal pilih pengiriman ── */}
        <Modal open={shippingModalOpen} onClose={() => setShippingModalOpen(false)} title="Pilih Pengiriman">
          {shippingLoading ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
              Menghitung biaya pengiriman...
            </p>
          ) : shippingError ? (
            <div className="text-sm">
              <p className="font-semibold text-red-600">Gagal menghitung biaya pengiriman.</p>
              <p className="mt-1 text-xs text-gray-500">Silakan coba lagi atau pilih alamat lain.</p>
              <button
                type="button"
                onClick={() => setShippingReloadKey((k) => k + 1)}
                className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Coba Lagi
              </button>
            </div>
          ) : shippingOptions.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada layanan pengiriman tersedia untuk alamat ini.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-bold text-gray-700">
                  Berat Barang: {formatWeightKg(shippingTotalWeightKg)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Layanan yang tidak sesuai berat pesanan otomatis tidak ditampilkan.
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" aria-hidden>
                  🔍
                </span>
                <input
                  type="text"
                  value={shippingSearch}
                  onChange={(e) => setShippingSearch(e.target.value)}
                  placeholder="Cari JNE, J&T, Wahana..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              {(() => {
                const regular = shippingOptions.filter((o) => o.category !== "CARGO");
                const cargo = shippingOptions.filter((o) => o.category === "CARGO");
                const q = shippingSearch.trim().toLowerCase();
                const match = (o: ShippingOption) =>
                  !q || `${o.name} ${o.service} ${o.description}`.toLowerCase().includes(q);
                const reg = regular.filter(match);
                const car = cargo.filter(match);
                return (
                  <div className="space-y-4">
                    {reg.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400">
                          Paket Reguler
                        </p>
                        <ShippingOptionList options={reg} selected={selectedShipping} onSelect={handleSelectShipping} />
                      </div>
                    )}
                    {car.length > 0 && (
                      <div className="border-t border-dashed border-gray-200 pt-3">
                        <p className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400">
                          Cargo / Trucking
                        </p>
                        <ShippingOptionList options={car} selected={selectedShipping} onSelect={handleSelectShipping} />
                      </div>
                    )}
                    {reg.length + car.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Tidak ada ekspedisi yang cocok dengan "{shippingSearch.trim()}".
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>

        {/* ── Modal pilih metode pembayaran ── */}
        <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Pilih Metode Pembayaran">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-400">Bank Transfer</p>
              <div className="space-y-2">
                {bankMethods.map((m) => (
                  <PaymentOption
                    key={m.id}
                    label={m.label}
                    desc={m.desc}
                    active={selectedMethod === m.id}
                    onClick={() => handleSelectPayment(m)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-400">E-Wallet / QRIS</p>
              <div className="space-y-2">
                {walletMethods.map((m) => (
                  <PaymentOption
                    key={m.id}
                    label={m.label}
                    desc={m.desc}
                    active={selectedMethod === m.id}
                    onClick={() => handleSelectPayment(m)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Modal>
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
                    {priceNotices[`${item.productId}:${item.typeName ?? ""}`] && (
                      <p className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold leading-snug text-amber-800">
                        {priceNotices[`${item.productId}:${item.typeName ?? ""}`]}
                      </p>
                    )}
                    {item.promoTitle && !priceNotices[`${item.productId}:${item.typeName ?? ""}`] && (
                      <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        🔥 {item.promoTitle}
                      </p>
                    )}

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
                      {!selectedAddressId && <option value="">Pilih alamat...</option>}
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} — {a.recipient}, {a.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Belum ada alamat */}
                {user && !addressesLoading && addresses.length === 0 && (
                  <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800">
                    Anda belum memiliki alamat pengiriman.{" "}
                    <Link href={addAddressHref} className="underline font-bold">
                      Tambah Alamat
                    </Link>{" "}
                    sebelum membuat pesanan.
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
                  disabled={submitting || (!!user && !addressesLoading && addresses.length === 0)}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-black text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Memproses..." : "Buat Pesanan"}
                </button>
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  Setelah pesanan dibuat, Anda akan memilih alamat, ongkir, dan metode pembayaran.
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

/** Modal / bottom-sheet responsif: mobile bottom sheet, desktop centered dialog.
 *  Kunci scroll halaman utama, bisa ditutup via ESC / backdrop / tombol ✕. */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-black text-gray-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/** Daftar pilihan ongkir, dikelompokkan per kurir sesuai urutan COURIERS.
 *  Service dalam satu kurir diurutkan dari harga termurah. */
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
        const courierOptions = options
          .filter((o) => o.code === c.code)
          .sort((a, b) => a.cost - b.cost);
        if (!courierOptions.length) return null;
        return (
          <div key={c.code} className="space-y-2">
            <p className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400">{c.name}</p>
            {courierOptions.map((opt) => {
              const active = selected?.code === opt.code && selected?.service === opt.service;
              return (
                <button
                  key={`${opt.code}-${opt.service}`}
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition ${
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
                    <span className="block text-sm font-bold text-gray-950">
                      {opt.service} <span className="font-medium text-gray-500">· {opt.description}</span>
                    </span>
                    <span className="block text-xs text-gray-500">Estimasi {formatEtd(opt.etd)}</span>
                  </span>
                  <span className="text-sm font-black text-gray-950">{formatPrice(opt.cost)}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}