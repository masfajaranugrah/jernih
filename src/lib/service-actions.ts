"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** Baca mitraId dari cookie server-side — zero DB query */
async function getMitraIdFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const mitraId = cookieStore.get("mh_mitra_id")?.value;
  if (!mitraId) {
    throw new Error("Session tidak valid. Silakan login ulang.");
  }
  return mitraId;
}

export interface ApiService {
  id: string;
  mitraId: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  priceFrom: string | number;
  unit: string;
  images: string[];
  isActive: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
  mitra?: { id: string; storeName: string; city?: string | null; logo?: string | null; rating: number };
  category?: { id: string; name: string; slug?: string } | null;
}

export interface CreateServiceInput {
  name: string;
  slug: string;
  categoryId?: string;
  description?: string;
  priceFrom: number;
  unit?: string;
  images?: string[];
  isActive?: boolean;
}

/** Ambil semua jasa dari DB — cache 60 detik, auto-revalidate */
export async function fetchServices(params?: {
  search?: string;
  categoryId?: string;
}): Promise<ApiService[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.categoryId) qs.set("categoryId", params.categoryId);

  // Kalau ada search query, jangan cache (hasil dinamis per query)
  const cacheOption = params?.search
    ? { cache: "no-store" as const }
    : { next: { revalidate: 300, tags: ["services"] } };

  const res = await fetch(`${API_URL}/services?${qs}`, cacheOption);
  if (!res.ok) return [];
  return res.json();
}

/** Ambil detail satu jasa by slug — cache 60 detik */
export async function fetchServiceBySlug(slug: string): Promise<ApiService | null> {
  const res = await fetch(`${API_URL}/services/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Ambil detail satu jasa by id */
export async function fetchServiceById(id: string): Promise<ApiService | null> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Tambah jasa baru dari admin dashboard */
export async function createService(data: CreateServiceInput): Promise<ApiService> {
  const mitraId = await getMitraIdFromCookie();

  const res = await fetch(`${API_URL}/services/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Kirim mitraId via header — backend langsung pakai, 0 DB lookup
      "X-Mitra-Id": mitraId,
    },
    body: JSON.stringify({
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      description: data.description,
      priceFrom: data.priceFrom,
      unit: data.unit ?? "project",
      images: data.images ?? [],
      isActive: data.isActive ?? true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(msg ?? `Gagal membuat jasa: ${res.status}`);
  }

  revalidatePath("/dashboard-admin/admin/services");
  revalidatePath("/jasa");
  revalidatePath("/");

  return res.json();
}

/** Edit jasa dari admin dashboard */
export async function editService(
  id: string,
  data: Partial<CreateServiceInput>
): Promise<ApiService> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(msg ?? `Gagal mengupdate jasa: ${res.status}`);
  }

  revalidatePath("/dashboard-admin/admin/services");
  revalidatePath("/jasa");
  revalidatePath("/");

  return res.json();
}

/** Hapus jasa dari admin dashboard */
export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Gagal menghapus jasa: ${res.status}`);
  }
  revalidatePath("/dashboard-admin/admin/services");
  revalidatePath("/jasa");
  revalidatePath("/");
}
