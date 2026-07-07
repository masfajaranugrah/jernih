"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

// ── Types ────────────────────────────────────────────────────────────────────

export type PromoItemType = "produk" | "jasa" | "sewa";

export interface PromoPickerItem {
  id: string;
  type: PromoItemType;
  name: string;
  slug: string;
  image: string;
  priceLabel: string;
  category: string;
  linkHref: string;
}

export interface PromoCard {
  id: string;
  title: string;
  category: string;
  price: string;
  image: string;
  linkHref: string;
}

// ── Fetch promo cards dari backend (server-side) ──────────────────────────────

export async function getPromoCardsFromBackend(): Promise<PromoCard[]> {
  try {
    const res = await fetch(`${API_URL}/settings/promo_cards`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ── Fetch semua item dari backend untuk picker ────────────────────────────────

export async function fetchAllItemsForPromo(): Promise<PromoPickerItem[]> {
  const [produkRes, jasaRes, sewaRes] = await Promise.allSettled([
    fetch(`${API_URL}/products?limit=100`, { cache: "no-store" }),
    fetch(`${API_URL}/services`, { cache: "no-store" }),
    fetch(`${API_URL}/rentals/items`, { cache: "no-store" }),
  ]);

  const items: PromoPickerItem[] = [];

  // Produk
  if (produkRes.status === "fulfilled" && produkRes.value.ok) {
    const data = await produkRes.value.json();
    const products: any[] = Array.isArray(data) ? data : (data.data ?? []);
    for (const p of products) {
      items.push({
        id: p.id,
        type: "produk",
        name: p.name,
        slug: p.slug,
        image: p.images?.[0] ?? "",
        priceLabel: p.price
          ? "Rp " + parseFloat(p.price).toLocaleString("id-ID")
          : "-",
        category: p.category?.name ?? "Produk",
        linkHref: `/produk/${p.slug}`,
      });
    }
  }

  // Jasa
  if (jasaRes.status === "fulfilled" && jasaRes.value.ok) {
    const services: any[] = await jasaRes.value.json();
    for (const s of services) {
      items.push({
        id: s.id,
        type: "jasa",
        name: s.name,
        slug: s.slug,
        image: s.images?.[0] ?? "",
        priceLabel: s.priceFrom
          ? "Mulai Rp " + parseFloat(s.priceFrom).toLocaleString("id-ID")
          : "-",
        category: s.category?.name ?? "Jasa",
        linkHref: `/jasa/${s.slug}`,
      });
    }
  }

  // Sewa
  if (sewaRes.status === "fulfilled" && sewaRes.value.ok) {
    const rentals: any[] = await sewaRes.value.json();
    for (const r of rentals) {
      items.push({
        id: r.id,
        type: "sewa",
        name: r.name,
        slug: r.slug,
        image: r.images?.[0] ?? "",
        priceLabel: r.pricePerDay
          ? "Rp " + parseFloat(r.pricePerDay).toLocaleString("id-ID") + "/hari"
          : "-",
        category: "Sewa",
        linkHref: `/sewa`,
      });
    }
  }

  return items;
}

// ── Helper: simpan seluruh promo_cards ke backend ────────────────────────────

async function savePromoCards(cards: PromoCard[], token: string): Promise<PromoCard[]> {
  const res = await fetch(`${API_URL}/settings/promo_cards`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cards),
  });
  if (!res.ok) throw new Error("Gagal menyimpan promo ke backend");
  const saved = await res.json();
  return Array.isArray(saved) ? saved : [];
}

// ── Promo CRUD (via backend settings) ────────────────────────────────────────

export async function createPromo(
  data: Omit<PromoCard, "id">,
  token: string
): Promise<PromoCard[]> {
  const existing = await getPromoCardsFromBackend();
  const newCard: PromoCard = { ...data, id: `promo-${Date.now()}` };
  const updated = [...existing, newCard];
  const saved = await savePromoCards(updated, token);
  revalidatePath("/dashboard-admin/admin/promo");
  revalidatePath("/");
  return saved;
}

export async function removePromo(
  id: string,
  token: string
): Promise<PromoCard[]> {
  const existing = await getPromoCardsFromBackend();
  const updated = existing.filter((p) => p.id !== id);
  const saved = await savePromoCards(updated, token);
  revalidatePath("/dashboard-admin/admin/promo");
  revalidatePath("/");
  return saved;
}
