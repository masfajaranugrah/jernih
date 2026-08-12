// midtrans/payment-methods.ts
// Mapping metode pembayaran UI → channel Midtrans (dipakai di `enabled_payments`).

export type PaymentMethodId =
  | 'bca_va'
  | 'bni_va'
  | 'bri_va'
  | 'mandiri_va'
  | 'gopay'
  | 'ovo'
  | 'shopeepay'
  | 'qris';

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  group: 'Bank Transfer' | 'E-Wallet / QRIS';
  channel: string; // nilai `enabled_payments` di Snap API
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bca_va', label: 'BCA Virtual Account', group: 'Bank Transfer', channel: 'bca_va' },
  { id: 'bni_va', label: 'BNI Virtual Account', group: 'Bank Transfer', channel: 'bni_va' },
  { id: 'bri_va', label: 'BRI Virtual Account', group: 'Bank Transfer', channel: 'bri_va' },
  { id: 'mandiri_va', label: 'Mandiri Virtual Account', group: 'Bank Transfer', channel: 'echannel' },
  { id: 'gopay', label: 'GoPay', group: 'E-Wallet / QRIS', channel: 'gopay' },
  { id: 'ovo', label: 'OVO', group: 'E-Wallet / QRIS', channel: 'ovo' },
  { id: 'shopeepay', label: 'ShopeePay', group: 'E-Wallet / QRIS', channel: 'shopeepay' },
  { id: 'qris', label: 'QRIS', group: 'E-Wallet / QRIS', channel: 'qris' },
];

export function getChannel(id: string): string | null {
  return PAYMENT_METHODS.find((m) => m.id === id)?.channel ?? null;
}

// ── Fee pembayaran ───────────────────────────────────────────────────────────
// Struktur: bank transfer = flat (tetap per transaksi); e-wallet/QRIS = persen.
export interface PaymentFee {
  type: 'flat' | 'percent';
  value: number; // flat: nominal tetap; percent: persentase (mis. 2 = 2%)
  min?: number;  // untuk percent: fee minimum (mis. Rp1.000)
}

export const PAYMENT_FEES: Record<PaymentMethodId, PaymentFee> = {
  bca_va: { type: 'flat', value: 4000 },
  bni_va: { type: 'flat', value: 4000 },
  bri_va: { type: 'flat', value: 4000 },
  mandiri_va: { type: 'flat', value: 3500 },
  gopay: { type: 'percent', value: 2, min: 1000 },
  ovo: { type: 'percent', value: 2, min: 1000 },
  shopeepay: { type: 'percent', value: 2, min: 1000 },
  qris: { type: 'percent', value: 0.7 },
};

/** Hitung fee admin Midtrans untuk suatu metode berdasarkan subtotal order. */
export function calculateFee(methodId: string, amount: number): number {
  const fee = PAYMENT_FEES[methodId as PaymentMethodId];
  if (!fee) return 0;
  if (fee.type === 'flat') return fee.value;
  const calc = (amount * fee.value) / 100;
  return Math.max(fee.min ?? 0, Math.round(calc));
}
