"use server";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export interface ApiRentalItem {
  id: string;
  mitraId: string;
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

/** Ambil semua item yang bisa disewa dari API backend */
export async function fetchRentalItems(params?: {
  search?: string;
}): Promise<ApiRentalItem[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);

  try {
    const res = await fetch(`${API_URL}/rentals/items?${qs}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
