"use server";

import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export interface ApiRentalItem {
  id: string;
  mitraId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  pricePerDay: string | number;
  deposit?: string | number | null;
  images: string[];
  isActive: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalItemInput {
  name: string;
  slug: string;
  description?: string;
  pricePerDay: number;
  deposit?: number;
  images?: string[];
  isActive?: boolean;
}

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

/** Ambil semua item yang bisa disewa */
export async function fetchRentalItems(params?: {
  search?: string;
  all?: boolean;
}): Promise<ApiRentalItem[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.all) qs.set("all", "true");

  try {
    const res = await fetch(`${API_URL}/rentals/items?${qs}`, {
      next: { revalidate: 300, tags: ["rentals"] },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Ambil satu item sewa by id */
export async function fetchRentalItemById(id: string): Promise<ApiRentalItem | null> {
  try {
    const res = await fetch(`${API_URL}/rentals/items/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Ambil satu item sewa by slug */
export async function fetchRentalItemBySlug(slug: string): Promise<ApiRentalItem | null> {
  try {
    const res = await fetch(`${API_URL}/rentals/items/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Tambah item sewa baru */
export async function createRentalItem(data: CreateRentalItemInput): Promise<ApiRentalItem> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    throw new Error("Session tidak valid. Silakan login ulang ke /dashboard-admin/admin/login");
  }

  const res = await fetch(`${API_URL}/rentals/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: data.name,
      slug: data.slug,
      description: data.description,
      pricePerDay: data.pricePerDay,
      deposit: data.deposit,
      images: data.images ?? [],
      isActive: data.isActive ?? true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(msg ?? `Gagal membuat item sewa: ${res.status}`);
  }

  updateTag("rentals");
  revalidatePath("/dashboard-admin/admin/rentals");
  revalidatePath("/sewa");
  revalidatePath("/");

  return res.json();
}

/** Edit item sewa */
export async function editRentalItem(
  id: string,
  data: Partial<CreateRentalItemInput>
): Promise<ApiRentalItem> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    throw new Error("Session tidak valid. Silakan login ulang ke /dashboard-admin/admin/login");
  }

  const res = await fetch(`${API_URL}/rentals/items/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(msg ?? `Gagal mengupdate item sewa: ${res.status}`);
  }

  updateTag("rentals");
  revalidatePath("/dashboard-admin/admin/rentals");
  revalidatePath("/sewa");
  revalidatePath("/");

  return res.json();
}

/** Hapus item sewa */
export async function deleteRentalItem(id: string): Promise<void> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    throw new Error("Session tidak valid. Silakan login ulang ke /dashboard-admin/admin/login");
  }

  const res = await fetch(`${API_URL}/rentals/items/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Gagal menghapus item sewa: ${res.status}`);
  }

  updateTag("rentals");
  revalidatePath("/dashboard-admin/admin/rentals");
  revalidatePath("/sewa");
  revalidatePath("/");
}
