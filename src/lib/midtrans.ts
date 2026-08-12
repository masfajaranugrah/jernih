// lib/midtrans.ts
// Helper Midtrans Snap untuk frontend — daftar metode bayar + loader snap.js.

export type PaymentMethodId =
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "mandiri_va"
  | "gopay"
  | "ovo"
  | "shopeepay"
  | "qris";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  group: "Bank Transfer" | "E-Wallet / QRIS";
  desc: string;
}

/** Daftar metode bayar yang ditampilkan di checkout — id = paymentMethod yg dikirim ke backend. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "bca_va", label: "BCA Virtual Account", group: "Bank Transfer", desc: "Transfer ke rekening virtual BCA" },
  { id: "bni_va", label: "BNI Virtual Account", group: "Bank Transfer", desc: "Transfer ke rekening virtual BNI" },
  { id: "bri_va", label: "BRI Virtual Account", group: "Bank Transfer", desc: "Transfer ke rekening virtual BRI" },
  { id: "mandiri_va", label: "Mandiri Virtual Account", group: "Bank Transfer", desc: "Transfer ke rekening virtual Mandiri" },
  { id: "gopay", label: "GoPay", group: "E-Wallet / QRIS", desc: "Bayar pakai saldo GoPay" },
  { id: "ovo", label: "OVO", group: "E-Wallet / QRIS", desc: "Bayar pakai saldo OVO" },
  { id: "shopeepay", label: "ShopeePay", group: "E-Wallet / QRIS", desc: "Bayar pakai ShopeePay" },
  { id: "qris", label: "QRIS", group: "E-Wallet / QRIS", desc: "Scan QR dari e-wallet / mobile banking mana pun" },
];

// ── Fee admin per metode (harus sinkron dengan backend) ──────────────────────
export interface PaymentFee {
  type: "flat" | "percent";
  value: number;
  min?: number;
}

export const PAYMENT_FEES: Record<PaymentMethodId, PaymentFee> = {
  bca_va: { type: "flat", value: 4000 },
  bni_va: { type: "flat", value: 4000 },
  bri_va: { type: "flat", value: 4000 },
  mandiri_va: { type: "flat", value: 3500 },
  gopay: { type: "percent", value: 2, min: 1000 },
  ovo: { type: "percent", value: 2, min: 1000 },
  shopeepay: { type: "percent", value: 2, min: 1000 },
  qris: { type: "percent", value: 0.7 },
};

/** Hitung fee admin Midtrans utk suatu metode berdasarkan subtotal order. */
export function calculateFee(methodId: PaymentMethodId, amount: number): number {
  const fee = PAYMENT_FEES[methodId];
  if (!fee) return 0;
  if (fee.type === "flat") return fee.value;
  const calc = (amount * fee.value) / 100;
  return Math.max(fee.min ?? 0, Math.round(calc));
}

export function getMidtransBase(): string {
  const prod = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  return prod ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";
}

export function getClientKey(): string {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

let snapPromise: Promise<void> | null = null;

/** Load snap.js sekali lalu resolve — idempoten. */
export function loadSnapScript(): Promise<void> {
  if (snapPromise) return snapPromise;

  snapPromise = new Promise((resolve, reject) => {
    const clientKey = getClientKey();
    if (!clientKey) {
      reject(new Error("MIDTRANS client key belum dikonfigurasi"));
      return;
    }
    if ((window as any).snap) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = getMidtransBase();
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      snapPromise = null;
      reject(new Error("Gagal memuat Midtrans Snap"));
    };
    document.head.appendChild(script);
  });

  return snapPromise;
}

/** Buka Snap payment. Callback opsional. */
export function payWithSnap(
  token: string,
  cb?: {
    onSuccess?: () => void;
    onPending?: () => void;
    onError?: () => void;
    onClose?: () => void;
  },
) {
  const snap = (window as any).snap;
  if (!snap) {
    cb?.onError?.();
    return;
  }
  snap.pay(token, {
    onSuccess: () => cb?.onSuccess?.(),
    onPending: () => cb?.onPending?.(),
    onError: () => cb?.onError?.(),
    onClose: () => cb?.onClose?.(),
  });
}
