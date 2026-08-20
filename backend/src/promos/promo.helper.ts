export type PromoStatus = 'scheduled' | 'active' | 'expired' | 'disabled';

export type PromoLike = {
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  quota?: number | null;
  soldCount?: number;
};

/**
 * Hitung status efektif sebuah promo berdasarkan status manual + tanggal.
 * - DISABLED  → disabled (tidak pernah tampil/dipakai)
 * - startDate di masa depan → scheduled
 * - endDate sudah lewat / quota habis → expired
 * - selainnya → active
 */
export function computePromoStatus(promo: PromoLike, now = new Date()): PromoStatus {
  if (promo.status === 'DISABLED') return 'disabled';
  const start = new Date(promo.startDate).getTime();
  const end = new Date(promo.endDate).getTime();
  const t = now.getTime();
  if (t < start) return 'scheduled';
  if (t > end) return 'expired';
  if (promo.status === 'EXPIRED') return 'expired';
  if (promo.status === 'SCHEDULED') return 'active';
  if (promo.quota !== null && promo.quota !== undefined && Number(promo.quota) - Number(promo.soldCount ?? 0) <= 0) return 'expired';
  return 'active';
}

/** Apakah promo benar-benar berlaku (bisa dipakai untuk harga) saat ini? */
export function isPromoActive(promo: PromoLike, now = new Date()): boolean {
  return computePromoStatus(promo, now) === 'active';
}

export type BuiltPromo = {
  id: string;
  title: string;
  subtitle: string | null;
  bannerImage: string | null;
  bannerBg: string;
  promoPrice: string;
  discountPercent: number;
  status: PromoStatus;
  quotaLeft: number | null;
  endsAt: string;
  startsAt: string;
  normalPrice?: string;
};

/**
 * Bangun representasi promo yang siap dikirim ke API.
 * normalPrice dipakai untuk menghitung persentase diskon bila belum diisi manual.
 */
export function buildPromo(
  promo: {
    id: string;
    title: string;
    subtitle?: string | null;
    bannerImage?: string | null;
    bannerBg?: string;
    promoPrice: string | number;
    discountPercent?: string | number | null;
    startDate: Date | string;
    endDate: Date | string;
    status: string;
    quota?: number | null;
    soldCount?: number | null;
    normalPrice?: string | number | null;
  },
  now = new Date(),
): BuiltPromo {
  const status = computePromoStatus(promo, now);
  const promoPrice = Number(promo.promoPrice);
  const normalPrice = promo.normalPrice !== undefined ? Number(promo.normalPrice) : null;

  let discountPercent = Number(promo.discountPercent ?? 0);
  if (!(discountPercent > 0) && normalPrice && normalPrice > 0 && promoPrice > 0 && normalPrice > promoPrice) {
    discountPercent = Math.round(((normalPrice - promoPrice) / normalPrice) * 100);
  }

  const quotaRaw = promo.quota === null || promo.quota === undefined ? null : Number(promo.quota);
  const soldRaw = Number(promo.soldCount ?? 0);
  const quotaLeft = quotaRaw === null ? null : Math.max(0, quotaRaw - soldRaw);

  return {
    id: promo.id,
    title: promo.title,
    subtitle: promo.subtitle ?? null,
    bannerImage: promo.bannerImage ?? null,
    bannerBg: promo.bannerBg ?? '#064e3b',
    promoPrice: String(promoPrice),
    discountPercent,
    status,
    quotaLeft,
    endsAt: new Date(promo.endDate).toISOString(),
    startsAt: new Date(promo.startDate).toISOString(),
    ...(normalPrice !== null ? { normalPrice: String(normalPrice) } : {}),
  };
}

/**
 * Ambil promo yang sedang aktif untuk sebuah produk (paling cepat berakhir).
 * `promos` adalah array raw row product_promos.
 */
export function pickActivePromo(promos: any[], now = new Date()): any | null {
  const active = (promos ?? [])
    .filter((p) => isPromoActive(p, now))
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  return active[0] ?? null;
}