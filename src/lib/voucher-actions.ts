"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type ApiVoucher = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minPurchase: string;
  maxDiscount: string | null;
  quota: number;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type CreateVoucherInput = {
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  quota?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
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

/** Daftar semua voucher (admin) */
export async function getVouchers(): Promise<ApiVoucher[]> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API_URL}/vouchers`, { headers, cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("[getVouchers] error:", err);
    return [];
  }
}

/** Buat voucher baru (admin) */
export async function createVoucher(
  data: CreateVoucherInput
): Promise<{ success: true; data: ApiVoucher } | { success: false; error: string }> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    return { success: false, error: "Session tidak valid. Silakan login ulang." };
  }

  try {
    const res = await fetch(`${API_URL}/vouchers`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
      return { success: false, error: msg ?? "Gagal membuat voucher." };
    }

    const voucher = await res.json();
    revalidatePath("/dashboard-admin/vouchers");
    return { success: true, data: voucher };
  } catch {
    return { success: false, error: "Gagal menghubungkan ke backend." };
  }
}

/** Hapus voucher (admin) */
export async function deleteVoucher(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    return { success: false, error: "Session tidak valid. Silakan login ulang." };
  }

  try {
    const res = await fetch(`${API_URL}/vouchers/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message ?? "Gagal menghapus voucher." };
    }

    revalidatePath("/dashboard-admin/vouchers");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghubungkan ke backend." };
  }
}
