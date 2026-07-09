"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type CreateProductInput = {
  name: string;
  slug: string;
  categoryId?: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images?: string[];
  isActive?: boolean;
  // field ekstra (tidak dikirim ke backend, hanya untuk UI)
  material?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  warranty?: string;
};

/** Baca mitraId dari cookie server-side — zero DB query */
async function getMitraIdFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const mitraId = cookieStore.get("mh_mitra_id")?.value;
  if (!mitraId) {
    throw new Error("Session tidak valid. Silakan login ulang.");
  }
  return mitraId;
}

/** Jalankan semua revalidation sekaligus — tidak blocking satu per satu */
function revalidateProductCaches() {
  revalidateTag("products");
  revalidatePath("/dashboard-admin/admin/products", "page");
  revalidatePath("/produk", "page");
  revalidatePath("/", "page");
}

/** Tambah produk baru ke database via backend API (dari admin dashboard) */
export async function createProduct(data: CreateProductInput) {
  const mitraId = await getMitraIdFromCookie();

  const payload = {
    name: data.name,
    slug: data.slug,
    categoryId: data.categoryId,
    description: data.description,
    price: data.price,
    oldPrice: data.oldPrice,
    stock: data.stock,
    images: data.images ?? [],
    isActive: data.isActive ?? true,
  };

  const res = await fetch(`${API_URL}/products/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Kirim mitraId via header — backend langsung pakai, 0 DB lookup
      "X-Mitra-Id": mitraId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Gagal membuat produk: ${res.status}`);
  }

  const result = await res.json();
  revalidateProductCaches();
  return result;
}

/** Hapus produk dari database via backend API */
export async function removeProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Gagal menghapus produk: ${res.status}`);
  }

  revalidateProductCaches();

  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

/** Update produk via backend API */
export async function editProduct(id: string, data: Partial<CreateProductInput>) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Gagal mengupdate produk: ${res.status}`);
  }

  const result = await res.json();
  revalidateProductCaches();
  return result;
}
