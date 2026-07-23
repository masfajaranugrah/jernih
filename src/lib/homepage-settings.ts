const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export interface HomepageSections {
  showHero: boolean;
  showPromo: boolean;
  showProduct: boolean;
  showJasa: boolean;
  showSewa: boolean;
}

const DEFAULTS: HomepageSections = {
  showHero: true,
  showPromo: true,
  showProduct: true,
  showJasa: true,
  showSewa: true,
};

/** Dipakai di server component (page.tsx) */
export async function getHomepageSections(): Promise<HomepageSections> {
  try {
    const res = await fetch(`${API_BASE}/settings/homepage_sections`, {
      next: { revalidate: 60, tags: ["homepage_sections"] },
    });
    if (!res.ok) return DEFAULTS;
    const data = await res.json();
    return { ...DEFAULTS, ...data };
  } catch {
    return DEFAULTS;
  }
}

/** Dipakai di client component (admin page) untuk GET */
export async function fetchHomepageSections(): Promise<HomepageSections> {
  const res = await fetch(`${API_BASE}/settings/homepage_sections`, {
    cache: "no-store",
  });
  if (!res.ok) return DEFAULTS;
  return res.json();
}

/** Dipakai di client component (admin page) untuk PUT — butuh token admin */
export async function saveHomepageSections(
  sections: HomepageSections,
  token: string
): Promise<HomepageSections> {
  const res = await fetch(`${API_BASE}/settings/homepage_sections`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sections),
  });
  if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
  return res.json();
}
