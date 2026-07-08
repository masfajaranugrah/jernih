// lib/hero-store.ts
// Data hero sekarang disimpan di backend PostgreSQL via /api/hero
// In-memory store hanya dipakai sebagai fallback default jika backend tidak tersedia

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

export type HeroMain = {
  badge: string;
  title: string;
  titleSuffix: string;
  description: string;
  ctaText: string;
  ctaColor: string;
  bgColor: string;
  imageUrl: string;
  imageAlt: string;
  linkHref: string;
};

export type HeroBanner = {
  id: string;
  label: string;
  bgColor: string;
  imageUrl: string;
  tagline?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaColor: string;
  ctaTextColor: string;
  align: "left" | "right" | "center";
};

export type HeroData = {
  main: HeroMain;
  banners: [HeroBanner, HeroBanner, HeroBanner];
};

// ── Default fallback ──────────────────────────────────────────────────────────
const defaultHero: HeroData = {
  main: {
    badge: "NEW",
    title: "OPPO Reno16 Series",
    titleSuffix: "5G",
    description: "Desain Planet 3D, AI Kolase Mix, dan Kamera Selfie 50MP Ultra-Wide.",
    ctaText: "Coming Soon",
    ctaColor: "text-violet-500",
    bgColor: "#e8e8fa",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2sBHgcwGGH682Inyv8khjDYHYbX2V-2nDdvvc4mF1xciPRPIbXaNE4jQJSc3iThWuBQ1p0BrO0VCkjdAZpQZjWuDfITkyMGoeIw4s7NHK93pJyoWp7KXBUVIbwtG8wIX4gb_-xTnGVAY4eSBxATkUa1JuEoJx-pbEbmwoenu-Y77Nvj_DozD8V-OgxDYtHzH7hrDLtanp6cQP0Awq5OI-tNH0SvqV6qUTAtpS0BXqHlibmgvINwED",
    imageAlt: "OPPO Reno16 Smartphone",
    linkHref: "/produk/iphone-15-pro-max",
  },
  banners: [
    {
      id: "banner-1",
      label: "Back to School",
      bgColor: "#0a3d62",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDpNifRldWIBvRGlcu1FBqXVXcDGPaRxCwJbi5C2bli8BQwy3AniMAkB6jTz9Oc0mHATR8bSF4s-l3wNET0ppjnTvneGCnHsYqddJIIV4AIUpF7xrUrvgv_exGfHO2AjwDlRdAsSpXLzrtwCPMbYoMxjKHL5ctTAsFvkC-W-lDoE6Gkkyj5gHAx8JvhkUH50IFPfeMWxXzDyWh8a1pRCTdiPpzLp6rtMaxlapIR-yigwgt3oux3kClU",
      tagline: "Gadget mulai",
      title: "1 Jutaan",
      subtitle: "BACK TO SCHOOL",
      ctaText: "",
      ctaColor: "",
      ctaTextColor: "",
      align: "right",
    },
    {
      id: "banner-2",
      label: "Gadget Impian",
      bgColor: "#2c1938",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAg7CQJ9BbYGsMyumKKW4-dQyC5gsNZvg1maEnASVeylC_M3BTFXGz2yP8nDo84r0buJa--BgpPg1XqF5jbOun53Hfe8cjD4Wx-HqQgAV4ACjcWaKmmvr1CtaLXxrwdBVJPCyJhumpiTjP4H0zxzxJkQLvHaMgDouXygf3018YrOPNMOEtIfnbow_MTSk7qqvUkO64jMVHfDoc5Bz8gAljBPEvlU03x00a8rO7suMV9MWYwcDWWWk93",
      tagline: "Semua Bisa Punya",
      title: "Gadget Impian!",
      subtitle: "Mulai Dari Rp 900.000",
      ctaText: "Selengkapnya",
      ctaColor: "bg-rose-600",
      ctaTextColor: "text-white",
      align: "left",
    },
    {
      id: "banner-3",
      label: "eraXpress",
      bgColor: "#1e3a8a",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCOaofM_Tbe2B0v9VD3NKO41giRxx-uNHrtaga7sfsGGRItPF-mhKYuxyA7v0wyKOuTxVuvrOMPhYj1v54wmnIX66gYcGvfEixhBOELGoqdSyWdp_3YNo_4_iz_48L_q6ZY9mGsKNPWndexdjfydsbB9uCuGmq-FKs34Oaxitcdg-xGZkAc9TGXiEUc52Bkl",
      tagline: "Pasti sampai hari ini",
      title: "eraXpress",
      subtitle: "",
      ctaText: "Info selengkapnya",
      ctaColor: "bg-white",
      ctaTextColor: "text-[#191c1d]",
      align: "center",
    },
  ],
};

// ── Helper: mapping dari response backend ke HeroData ────────────────────────
function mapBackendToHeroData(banners: any[]): HeroData {
  // position 0 = main hero, 1 = banner kanan atas, 2 = kiri bawah, 3 = kanan bawah
  const main = banners.find((b) => b.position === 0);
  const b0 = banners.find((b) => b.position === 1);
  const b1 = banners.find((b) => b.position === 2);
  const b2 = banners.find((b) => b.position === 3);

  return {
    main: main
      ? {
          badge: main.badge ?? defaultHero.main.badge,
          title: main.title ?? defaultHero.main.title,
          titleSuffix: main.titleSuffix ?? defaultHero.main.titleSuffix,
          description: main.description ?? defaultHero.main.description,
          ctaText: main.ctaText ?? defaultHero.main.ctaText,
          ctaColor: main.ctaColor ?? defaultHero.main.ctaColor,
          bgColor: main.bgColor ?? defaultHero.main.bgColor,
          imageUrl: main.imageUrl ?? defaultHero.main.imageUrl,
          imageAlt: main.imageAlt ?? defaultHero.main.imageAlt,
          linkHref: main.linkHref ?? defaultHero.main.linkHref,
        }
      : defaultHero.main,
    banners: [
      b0
        ? {
            id: String(b0.id),
            label: b0.badge ?? b0.title ?? "",
            bgColor: b0.bgColor ?? defaultHero.banners[0].bgColor,
            imageUrl: b0.imageUrl ?? "",
            tagline: b0.tagline ?? "",
            title: b0.title ?? "",
            subtitle: b0.subtitle ?? "",
            ctaText: b0.ctaText ?? "",
            ctaColor: b0.ctaColor ?? "",
            ctaTextColor: b0.ctaTextColor ?? "",
            align: (b0.align as "left" | "right" | "center") ?? "left",
          }
        : defaultHero.banners[0],
      b1
        ? {
            id: String(b1.id),
            label: b1.badge ?? b1.title ?? "",
            bgColor: b1.bgColor ?? defaultHero.banners[1].bgColor,
            imageUrl: b1.imageUrl ?? "",
            tagline: b1.tagline ?? "",
            title: b1.title ?? "",
            subtitle: b1.subtitle ?? "",
            ctaText: b1.ctaText ?? "",
            ctaColor: b1.ctaColor ?? "",
            ctaTextColor: b1.ctaTextColor ?? "",
            align: (b1.align as "left" | "right" | "center") ?? "left",
          }
        : defaultHero.banners[1],
      b2
        ? {
            id: String(b2.id),
            label: b2.badge ?? b2.title ?? "",
            bgColor: b2.bgColor ?? defaultHero.banners[2].bgColor,
            imageUrl: b2.imageUrl ?? "",
            tagline: b2.tagline ?? "",
            title: b2.title ?? "",
            subtitle: b2.subtitle ?? "",
            ctaText: b2.ctaText ?? "",
            ctaColor: b2.ctaColor ?? "",
            ctaTextColor: b2.ctaTextColor ?? "",
            align: (b2.align as "left" | "right" | "center") ?? "center",
          }
        : defaultHero.banners[2],
    ],
  };
}

// ── Fetch dari backend (untuk Server Component) ───────────────────────────────
export async function getHeroDataFromBackend(): Promise<HeroData> {
  try {
    const res = await fetch(`${API_URL}/hero`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return defaultHero;
    const banners: any[] = await res.json();
    if (!banners || banners.length === 0) return defaultHero;
    return mapBackendToHeroData(banners);
  } catch {
    return defaultHero;
  }
}

// ── Legacy: getHeroData tetap ada untuk backward compat tapi sekarang sync fallback
export function getHeroData(): HeroData {
  return defaultHero;
}

// ── Untuk HeroEditor: fetch data terbaru dari backend ────────────────────────
export async function fetchHeroForEditor(): Promise<HeroData> {
  return getHeroDataFromBackend();
}

// ── In-memory update (tidak lagi dipakai untuk persist, hanya legacy) ─────────
export function updateHeroMain(_data: Partial<HeroMain>) { /* deprecated */ }
export function updateHeroBanner(_index: 0 | 1 | 2, _data: Partial<HeroBanner>) { /* deprecated */ }
export function resetHeroData() { /* deprecated */ }
