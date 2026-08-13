// lib/hero-store.ts
// Data hero sekarang disimpan di backend PostgreSQL via /api/hero
// In-memory store hanya dipakai sebagai fallback default jika backend tidak tersedia

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type HeroBanner = {
  id: string;
  position: number; // 0=main, 1=top-right, 2=bottom-right
  badge: string;     // maps to 'badge' in DB, also supports label
  title: string;
  titleSuffix?: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  ctaText: string;
  ctaColor: string;
  ctaTextColor: string;
  bgColor: string;
  imageUrl: string;
  imageAlt?: string;
  linkHref: string;
  align: "left" | "right" | "center";
  isActive: boolean;
};

export type HeroData = {
  main: HeroBanner[];
  topRight: HeroBanner[];
  bottomRight: HeroBanner[];
};

// ── Default fallback jika backend kosong/error ────────────────────────────────
export const defaultHero: HeroData = {
  main: [],
  topRight: [],
  bottomRight: [],
};

// ── Helper: mapping dari response backend ke HeroData ────────────────────────
export function mapBackendToHeroData(banners: any[]): HeroData {
  const main: HeroBanner[] = [];
  const topRight: HeroBanner[] = [];
  const bottomRight: HeroBanner[] = [];

  for (const b of banners) {
    const banner: HeroBanner = {
      id: String(b.id),
      position: Number(b.position ?? 0),
      badge: b.badge ?? b.label ?? "",
      title: b.title ?? "",
      titleSuffix: b.titleSuffix ?? "",
      subtitle: b.subtitle ?? "",
      tagline: b.tagline ?? "",
      description: b.description ?? "",
      ctaText: b.ctaText ?? "",
      ctaColor: b.ctaColor ?? "",
      ctaTextColor: b.ctaTextColor ?? "",
      bgColor: b.bgColor ?? "#064e3b",
      imageUrl: b.imageUrl ?? "",
      imageAlt: b.imageAlt ?? "",
      linkHref: b.linkHref ?? "",
      align: (b.align as "left" | "right" | "center") ?? "left",
      isActive: b.isActive ?? true,
    };

    if (banner.position === 0) {
      main.push(banner);
    } else if (banner.position === 1) {
      topRight.push(banner);
    } else {
      bottomRight.push(banner);
    }
  }

  return { main, topRight, bottomRight };
}

// ── Fetch dari backend (untuk Server Component) ───────────────────────────────
export async function getHeroDataFromBackend(): Promise<HeroData> {
  try {
    const res = await fetch(`${API_URL}/hero`, {
      next: { revalidate: 300, tags: ["hero"] },
    });
    if (!res.ok) return defaultHero;
    const banners: any[] = await res.json();
    if (!banners || banners.length === 0) return defaultHero;
    return mapBackendToHeroData(banners);
  } catch {
    return defaultHero;
  }
}

// ── Legacy: getHeroData tetap ada untuk backward compat
export function getHeroData(): HeroData {
  return defaultHero;
}

// ── Untuk HeroEditor: fetch data terbaru dari backend ────────────────────────
export async function fetchHeroForEditor(): Promise<HeroData> {
  return getHeroDataFromBackend();
}
