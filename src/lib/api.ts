// lib/api.ts
// Helper untuk fetch ke NestJS backend dari Next.js server components

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  description: string | null;
  price: string;       // Prisma Decimal → string di JSON
  oldPrice: string | null;
  stock: number;
  images: string[];
  isActive: boolean;
  rating: number;
  totalSold: number;
  createdAt: string;
  mitra?: { id: string; storeName: string; city: string };
  category?: { id: string; name: string; slug: string } | null;
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
}): Promise<ApiProduct[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.page) qs.set("page", String(params.page));

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
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("[fetchProductBySlug] error:", e);
    return null;
  }
}

/** Format harga dari Prisma Decimal string ke Rupiah */
export function formatRupiah(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp" + num.toLocaleString("id-ID");
}
