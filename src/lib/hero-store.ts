// lib/hero-store.ts
// Simulasi persistent store untuk konten hero banner.
// Di production, ini diganti dengan database (Prisma, Supabase, dsb).

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
  banners: [HeroBanner, HeroBanner, HeroBanner]; // 3 banner kanan
};

// Default data — sama persis seperti yang tampil di halaman utama sekarang
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
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCOaofM_Tbe2B0v9VD3NKO41giRxx-uNHrtaga7sfsGGRItPF-mhKYuxyA7v0wyKOuTxVuvrOMPhYj1v54wmnIX66gYcGvfEixhBOELGoqdSyWdp_3VJmzQwEht95a9u00FSNDM7Am8ZWuqdih0-fie5xw_-FWcVzpoDt_--3YNo_4_iz_48L_q6ZY9mGsKNPWndexdjfydsbB9uCuGmq-FKs34Oaxitcdg-xGZkAc9TGXiEUc52Bkl",
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

// In-memory store (persists selama server process hidup, cukup untuk demo)
let heroStore: HeroData = { ...defaultHero };

export function getHeroData(): HeroData {
  return heroStore;
}

export function updateHeroMain(data: Partial<HeroMain>) {
  heroStore = {
    ...heroStore,
    main: { ...heroStore.main, ...data },
  };
}

export function updateHeroBanner(index: 0 | 1 | 2, data: Partial<HeroBanner>) {
  const banners = [...heroStore.banners] as HeroData["banners"];
  banners[index] = { ...banners[index], ...data };
  heroStore = { ...heroStore, banners };
}

export function resetHeroData() {
  heroStore = { ...defaultHero };
}
