"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { HeroMain, HeroBanner } from "@/lib/hero-store";

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
  "bgColor", "imageUrl", "imageAlt", "linkHref", "align", "isActive",
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
    // field lain diabaikan
  }

  return result;
}

// ── Helper: kirim PUT ke backend ─────────────────────────────────────────────
async function putHero(position: number, data: object) {
  const token = await getServerToken();
  const payload = transformBannerPayload(data as Record<string, unknown>);
  const res = await fetch(`${API_URL}/hero/${position}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal simpan hero position ${position}: ${err}`);
  }
  return res.json();
}

// ── Server actions ───────────────────────────────────────────────────────────

/** Simpan hero main (position 0) */
export async function saveHeroMain(data: Partial<HeroMain>) {
  await putHero(0, data);
  revalidatePath("/");
}

/** Simpan banner (position 1, 2, 3) */
export async function saveHeroBanner(
  index: 0 | 1 | 2,
  data: Partial<HeroBanner>,
) {
  // index 0 = banner kanan atas → position 1
  // index 1 = banner kiri bawah → position 2
  // index 2 = banner kanan bawah → position 3
  await putHero(index + 1, data);
  revalidatePath("/");
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
