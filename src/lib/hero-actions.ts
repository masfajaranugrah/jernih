"use server";

import { revalidatePath } from "next/cache";
import type { HeroMain, HeroBanner } from "@/lib/hero-store";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

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
async function putHero(position: number, data: object, token: string) {
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
export async function saveHeroMain(data: Partial<HeroMain>, token: string) {
  await putHero(0, data, token);
  revalidatePath("/");
}

/** Simpan banner (position 1, 2, 3) */
export async function saveHeroBanner(
  index: 0 | 1 | 2,
  data: Partial<HeroBanner>,
  token: string
) {
  // index 0 = banner kanan atas → position 1
  // index 1 = banner kiri bawah → position 2
  // index 2 = banner kanan bawah → position 3
  await putHero(index + 1, data, token);
  revalidatePath("/");
}

/** Reset semua hero ke default */
export async function resetHero(token: string) {
  const res = await fetch(`${API_URL}/hero/reset`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal reset hero");
  revalidatePath("/");
}
