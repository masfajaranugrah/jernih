"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { HeroBanner } from "@/lib/hero-store";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** Baca token HttpOnly cookie dari server — aman dari XSS */
async function getServerToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("mh_token")?.value;
  if (!token) throw new Error("Session tidak valid. Silakan login ulang.");
  return token;
}

// Field yang diterima backend (sesuai UpdateHeroBannerDto)
const ALLOWED_HERO_FIELDS = new Set([
  "badge", "title", "titleSuffix", "subtitle", "tagline",
  "description", "ctaText", "ctaColor", "ctaTextColor",
  "bgColor", "imageUrl", "imageAlt", "linkHref", "align", "isActive", "position",
]);

/**
 * Transformasi payload frontend → backend:
 * - Rename: label → badge
 * - Strip: id (tidak ada di DTO backend)
 * - Strip: field lain yang tidak dikenali backend
 */
function transformBannerPayload(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "label") {
      // frontend pakai "label", backend pakai "badge"
      result["badge"] = value;
    } else if (key === "id") {
      // id tidak dikirim ke backend (dikelola oleh DB)
      continue;
    } else if (ALLOWED_HERO_FIELDS.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

// ── Server Actions ───────────────────────────────────────────────────────────

/** Tambah banner baru (Create) */
export async function createHeroBanner(data: Partial<HeroBanner>) {
  const token = await getServerToken();
  const payload = transformBannerPayload(data as Record<string, unknown>);
  const res = await fetch(`${API_URL}/hero`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal membuat hero banner: ${err}`);
  }
  revalidatePath("/");
  return res.json();
}

/** Simpan perubahan banner (Update) */
export async function saveHeroBanner(
  id: string,
  data: Partial<HeroBanner>,
) {
  const token = await getServerToken();
  const payload = transformBannerPayload(data as Record<string, unknown>);
  const res = await fetch(`${API_URL}/hero/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal memperbarui hero banner ${id}: ${err}`);
  }
  revalidatePath("/");
  return res.json();
}

/** Hapus banner (Delete) */
export async function deleteHeroBanner(id: string) {
  const token = await getServerToken();
  const res = await fetch(`${API_URL}/hero/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal menghapus hero banner ${id}: ${err}`);
  }
  revalidatePath("/");
  return res.json();
}

/** Reset semua hero ke default */
export async function resetHero() {
  const token = await getServerToken();
  const res = await fetch(`${API_URL}/hero/reset`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal reset hero");
  revalidatePath("/");
}
