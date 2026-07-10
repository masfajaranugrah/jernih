"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: string;
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

/** Header auth standar */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getTokenFromCookie();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Fetch kategori dari backend */
export async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("[getCategories] error:", err);
    return [];
  }
}

/** Tambah kategori baru */
export async function createCategory(data: { name: string; icon?: string }): Promise<{ success: true; data: ApiCategory } | { success: false; error: string }> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    return { success: false, error: "Session tidak valid. Silakan login ulang." };
  }

  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message ?? "Gagal menambahkan kategori." };
    }

    const category = await res.json();
    revalidatePath("/dashboard-admin/admin/categories");
    return { success: true, data: category };
  } catch {
    return { success: false, error: "Gagal menghubungkan ke backend." };
  }
}

/** Update kategori */
export async function updateCategory(id: string, data: { name?: string; icon?: string }): Promise<{ success: true; data: ApiCategory } | { success: false; error: string }> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    return { success: false, error: "Session tidak valid. Silakan login ulang." };
  }

  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message ?? "Gagal mengubah kategori." };
    }

    const category = await res.json();
    revalidatePath("/dashboard-admin/admin/categories");
    return { success: true, data: category };
  } catch {
    return { success: false, error: "Gagal menghubungkan ke backend." };
  }
}

/** Hapus kategori */
export async function deleteCategory(id: string): Promise<{ success: true } | { success: false; error: string }> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    return { success: false, error: "Session tidak valid. Silakan login ulang." };
  }

  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message ?? "Gagal menghapus kategori." };
    }

    revalidatePath("/dashboard-admin/admin/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghubungkan ke backend." };
  }
}
