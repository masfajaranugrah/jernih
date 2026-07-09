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

/** Baca JWT token dari cookie server-side */
async function getTokenFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("mh_token")?.value;
  if (!token) {
    throw new Error("Session tidak valid. Silakan login ulang.");
  }
  return token;
}

/** Header auth standar — ambil token dari cookie, kirim sebagai Bearer */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getTokenFromCookie();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Jalankan semua revalidation sekaligus — tidak blocking satu per satu */
function revalidateProductCaches() {
  revalidateTag("products", { expire: 0 });
  revalidatePath("/dashboard-admin/admin/products", "page");
  revalidatePath("/produk", "page");
  revalidatePath("/", "page");
}

/** Tambah produk baru ke database via backend API */
export async function createProduct(data: CreateProductInput) {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    throw new Error(
      "Session tidak valid. Silakan login ulang ke /dashboard-admin/admin/login"
    );
  }

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

  let res: Response;
  try {
    res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Pastikan backend berjalan."
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message;
    throw new Error(msg ?? `Gagal membuat produk: ${res.status}`);
  }

  const result = await res.json();
  revalidateProductCaches();
  return result;
}

/** Hapus produk dari database via backend API */
export async function removeProduct(id: string) {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    throw new Error(
      "Session tidak valid. Silakan login ulang ke /dashboard-admin/admin/login"
    );
  }

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers,
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
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    throw new Error(
      "Session tidak valid. Silakan login ulang ke /dashboard-admin/admin/login"
    );
  }

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers,
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
