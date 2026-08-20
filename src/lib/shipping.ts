// lib/shipping.ts
// Helper ongkir frontend — harus sinkron dengan backend (ShippingService).

/** Kurir default untuk auto-pilih opsi pertama. */
export const DEFAULT_COURIER = "jne";

/** Daftar kurir yang ditawarkan — harus sinkron dengan backend (ShippingService.SUPPORTED_COURIERS). */
export const COURIERS = [
  { code: "jne", name: "JNE" },
  { code: "jnt", name: "J&T" },
  { code: "wahana", name: "Wahana" },
] as const;

export type ShippingCategory = "REGULAR" | "EXPRESS" | "SPECIAL" | "CARGO";

export type ShippingOption = {
  code: string; // kode kurir (mis. "jne")
  name: string; // nama kurir (mis. "JNE")
  service: string; // layanan (mis. "REG")
  description: string; // "JNE REG"
  cost: number; // ongkir rupiah
  etd: string; // estimasi ternormalisasi: "3", "2-4", "0" = hari ini
  category: ShippingCategory; // REGULAR | EXPRESS | SPECIAL | CARGO
  note: string;
};

export function formatEtd(etd?: string | null): string {
  if (!etd) return "—";
  const e = etd.trim();
  if (e === "0") return "Hari ini";
  return `${e} hari`;
}

/** Tampilkan berat dari backend (satu-satunya sumber) — mis. "1 kg", "2.5 kg". */
export function formatWeightKg(totalWeightKg?: number | null): string {
  if (totalWeightKg == null) return "—";
  return `${Number(totalWeightKg).toLocaleString("id-ID")} kg`;
}

/** Pilih opsi pertama yang bukan cargo/trucking (utk auto-select). */
export function preferNonCargo(options: ShippingOption[]): ShippingOption | null {
  return options.find((o) => o.category !== "CARGO") ?? options[0] ?? null;
}

export type ShippingCostResponse = {
  addressId: string;
  totalWeightGrams: number;
  totalWeightKg: number;
  courier: string;
  destinationId: string;
  options: ShippingOption[];
};