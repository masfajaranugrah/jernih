// lib/api.ts
// Helper untuk fetch ke NestJS backend dari Next.js server components

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type ApiProductType = {
  id: string;
  productId: string;
  name: string;
  price: string;
  oldPrice: string | null;
  stock: number;
  isActive: boolean;
};

export type ApiProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  userAvatar: string | null;
  image?: string | null;
  createdAt: string;
};

export type ApiProductPromo = {
  id: string;
  title: string;
  subtitle: string | null;
  bannerImage: string | null;
  bannerBg: string;
  promoPrice: string;
  discountPercent: number;
  status: "scheduled" | "active" | "expired" | "disabled";
  quotaLeft: number | null;
  endsAt: string;
  startsAt: string;
  normalPrice?: string;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  description: string | null;
  price: string;
  oldPrice: string | null;
  stock: number;
  images: string[];
  isActive: boolean;
  rating: number;
  totalSold: number;
  createdAt: string;
  category?: { id: string; name: string; slug: string } | null;
  types?: ApiProductType[];
  reviews?: ApiProductReview[];
  promo?: ApiProductPromo | null;
};

export type ProductsResponse = {
  data: ApiProduct[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Ambil daftar produk dari database via backend API */
export async function fetchProducts(params?: {
  search?: string;
  categoryId?: string;
  limit?: number;
  page?: number;
  noCache?: boolean;
  light?: boolean;
}): Promise<ApiProduct[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.page) qs.set("page", String(params.page));
    if (params?.light) qs.set("light", "true");

    const url = `${API_URL}/products${qs.toString() ? `?${qs}` : ""}`;

    const res = await fetch(url, {
      cache: params?.noCache ? "no-store" : "default",
      next: params?.noCache ? undefined : { revalidate: 300, tags: ["products"] },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const json: ProductsResponse = await res.json();
    return json.data ?? [];
  } catch (e) {
    console.error("[fetchProducts] error:", e);
    return [];
  }
}

/** Ambil satu produk by slug */
export async function fetchProductBySlug(slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60, tags: ["products"] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("[fetchProductBySlug] error:", e);
    return null;
  }
}

/** Format harga (decimal string dari DB) ke Rupiah */
export function formatRupiah(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Rp0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Rp0";
  return "Rp" + num.toLocaleString("id-ID");
}

// ── Promo ────────────────────────────────────────────────────────────────

/** Harga efektif produk: harga promo jika promo sedang aktif, else harga normal. */
export function getProductPricing(p: { price: string; promo?: ApiProductPromo | null }) {
  const promo = p.promo && p.promo.status === "active" ? p.promo : null;
  const basePrice = Number(p.price);
  const displayPrice = promo ? Number(promo.promoPrice) : basePrice;
  const discountPercent = promo?.discountPercent ?? 0;
  const hasDiscount = displayPrice > 0 && basePrice > displayPrice;
  return { basePrice, displayPrice, discountPercent, hasDiscount, promo };
}

export type ApiPromo = ApiProductPromo & {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    oldPrice: string | null;
    stock: number;
    images: string[];
    category?: { id: string; name: string; slug: string } | null;
  } | null;
};

export type PromosResponse = {
  data: ApiPromo[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Ambil daftar promo produk (halaman /promo) */
export async function fetchPromos(params?: {
  status?: "active" | "scheduled" | "expired" | "disabled" | "all";
  search?: string;
  sort?: "price_asc" | "price_desc" | "discount_desc" | "newest";
  page?: number;
  limit?: number;
  noCache?: boolean;
}): Promise<ApiPromo[]> {
  try {
    const qs = new URLSearchParams();
    qs.set("status", params?.status ?? "all");
    if (params?.search) qs.set("search", params.search);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.page) qs.set("page", String(params.page));

    const res = await fetch(`${API_URL}/promos?${qs}`, {
      cache: params?.noCache ? "no-store" : "default",
      next: params?.noCache ? undefined : { revalidate: 60, tags: ["promos"] },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json: PromosResponse = await res.json();
    return json.data ?? [];
  } catch (e) {
    console.error("[fetchPromos] error:", e);
    return [];
  }
}

/** Ambil promo banner untuk homepage */
export async function fetchPromoBanner(noCache?: boolean): Promise<ApiPromo | null> {
  try {
    const res = await fetch(`${API_URL}/promos/banner`, {
      cache: noCache ? "no-store" : "default",
      next: noCache ? undefined : { revalidate: 60, tags: ["promos"] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("[fetchPromoBanner] error:", e);
    return null;
  }
}
