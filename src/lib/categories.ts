// lib/categories.ts
// Struktur kategori bersarang (tree) untuk produk marketplace

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string; // material-symbols icon name
  children?: Category[];
};

export const CATEGORIES: Category[] = [
  {
    id: "elektronik",
    name: "Elektronik",
    slug: "elektronik",
    icon: "devices",
    children: [
      { id: "elektronik-laptop", name: "Laptop", slug: "laptop", icon: "laptop" },
      { id: "elektronik-komputer", name: "Komputer", slug: "komputer", icon: "desktop_windows" },
      { id: "elektronik-monitor", name: "Monitor", slug: "monitor", icon: "monitor" },
      { id: "elektronik-smartphone", name: "Smartphone", slug: "smartphone", icon: "smartphone" },
      { id: "elektronik-aksesoris", name: "Aksesoris", slug: "aksesoris-elektronik", icon: "headphones" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    icon: "checkroom",
    children: [
      { id: "fashion-pria", name: "Pria", slug: "fashion-pria", icon: "man" },
      { id: "fashion-wanita", name: "Wanita", slug: "fashion-wanita", icon: "woman" },
      { id: "fashion-anak", name: "Anak", slug: "fashion-anak", icon: "child_care" },
    ],
  },
  {
    id: "rumah-tangga",
    name: "Rumah Tangga",
    slug: "rumah-tangga",
    icon: "home",
    children: [
      { id: "rumah-dapur", name: "Dapur", slug: "dapur", icon: "kitchen" },
      { id: "rumah-kamar", name: "Kamar Tidur", slug: "kamar-tidur", icon: "bed" },
      { id: "rumah-dekorasi", name: "Dekorasi", slug: "dekorasi", icon: "style" },
    ],
  },
  {
    id: "makanan-minuman",
    name: "Makanan & Minuman",
    slug: "makanan-minuman",
    icon: "restaurant",
  },
  {
    id: "kesehatan",
    name: "Kesehatan",
    slug: "kesehatan",
    icon: "health_and_safety",
    children: [
      { id: "kesehatan-vitamin", name: "Vitamin & Suplemen", slug: "vitamin-suplemen" },
      { id: "kesehatan-alat", name: "Alat Kesehatan", slug: "alat-kesehatan" },
      { id: "kesehatan-perawatan", name: "Perawatan Tubuh", slug: "perawatan-tubuh" },
    ],
  },
  {
    id: "olahraga",
    name: "Olahraga",
    slug: "olahraga",
    icon: "fitness_center",
    children: [
      { id: "olahraga-pakaian", name: "Pakaian Olahraga", slug: "pakaian-olahraga" },
      { id: "olahraga-alat", name: "Alat Olahraga", slug: "alat-olahraga" },
      { id: "olahraga-sepatu", name: "Sepatu Olahraga", slug: "sepatu-olahraga" },
    ],
  },
  {
    id: "otomotif",
    name: "Otomotif",
    slug: "otomotif",
    icon: "directions_car",
    children: [
      { id: "otomotif-aksesoris-mobil", name: "Aksesoris Mobil", slug: "aksesoris-mobil" },
      { id: "otomotif-aksesoris-motor", name: "Aksesoris Motor", slug: "aksesoris-motor" },
      { id: "otomotif-sparepart", name: "Spare Part", slug: "spare-part" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Daftar flat semua kategori (termasuk sub-kategori) */
export function flattenCategories(cats: Category[] = CATEGORIES): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

/** Ambil kategori berdasarkan id */
export function getCategoryById(id: string): Category | undefined {
  return flattenCategories().find((c) => c.id === id);
}

/** Opsi untuk `<select>` — flat dengan indentasi visual */
export type SelectOption = { value: string; label: string; isParent: boolean };

export function getCategoryOptions(): SelectOption[] {
  const options: SelectOption[] = [];
  for (const cat of CATEGORIES) {
    options.push({ value: cat.id, label: cat.name, isParent: true });
    if (cat.children) {
      for (const sub of cat.children) {
        options.push({ value: sub.id, label: `  └ ${sub.name}`, isParent: false });
      }
    }
  }
  return options;
}
