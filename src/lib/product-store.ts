// lib/product-store.ts
// In-memory store untuk produk & promo (diganti database saat backend aktif)

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[]; // URL gambar
  material?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  warranty?: string;
  isActive: boolean;
  createdAt: string;
};

export type PromoCard = {
  id: string;
  title: string;
  category: string; // label badge
  price: string;    // teks harga display
  image: string;    // URL gambar
  linkHref: string;
};

// ── Produk default (seed) ─────────────────────────────────────────────────────
const defaultProducts: Product[] = [
  {
    id: "prod-1",
    name: "Laptop Gaming ASUS ROG",
    slug: "laptop-gaming-asus-rog",
    categoryId: "elektronik-laptop",
    description: "Laptop gaming bertenaga tinggi dengan prosesor terbaru untuk pengalaman gaming terbaik.",
    price: 15000000,
    oldPrice: 16500000,
    stock: 10,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCKtONE-oOqQ1l01e4k2hpIrpB7-qqdVH3ANTOcWoB_90mpL3Ug5XEPnfSCS75joY6bUTS9cKl2luQHYfuYcA6SlY4BMhKTI_2IdhbEtcbM7s9ZXSj3R1uknHV-p5au81dvYQXnglm6cKsxgKOHODtyzzHPXtB_Em_7wwSkDs9t-u9pGAg4VoYxkUyrmN85N_OlCtDrorssavgi_f2N-5POP4psuw_h0yLzJLK-MI4XTgvbo9FeZk",
    ],
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "prod-2",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    categoryId: "elektronik-smartphone",
    description: "Smartphone flagship Apple dengan kamera 48MP dan chip A17 Pro.",
    price: 22000000,
    stock: 5,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdkTocgES_sIazNeSnxhbhnRee2GCElj-hX4aZRsNYyPfmej2vRLCS9_kzETc8q7mDeBVlLQiIXmQ67iJz69xKTZsosdO3zkK1D-VUYMYaPxIfepAzaPK-FLryaoDh9jRGysrfduI14hXzL3cRad8MqbM_eNYeLGsVK0twQ31Njz20txq3hNNlP6ZwuZF3inV4GpktY8SFZx36Xw5a18Mg2Fznqls_d7kxm82cYxkpaPlX5FgSzhYV",
    ],
    isActive: true,
    createdAt: "2024-01-02",
  },
  {
    id: "prod-3",
    name: "Headphone Sony WH-1000XM5",
    slug: "headphone-sony-wh-1000xm5",
    categoryId: "elektronik-aksesoris",
    description: "Headphone premium dengan noise cancelling terbaik di kelasnya.",
    price: 4500000,
    oldPrice: 5000000,
    stock: 20,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHKyz3QvmoE8gaJ0uO9TR_ky-QqVfuRHdvDiLrGglbnhqtNXJqF3u5NblTbAescIy3-irxKTZDfUtIgDKIrK54fXsITc8gdxXCpS0aSnYtRoLReU3NA_8QlJfboy4c0t1SLJi9usU2yDEhxvdxFytBbUVkviKcQgds2tpIIv1YmZkfRJvVYId2CqvC24MzezVjMESFkmtk-bBO0q1oRay49n9zz50dioAxQHQ-oNlbryJ90mCQXfLb",
    ],
    isActive: true,
    createdAt: "2024-01-03",
  },
];

// ── Promo default ─────────────────────────────────────────────────────────────
// Data promo sekarang disimpan di backend via settings key "promo_cards"
// Edit promo di: /dashboard-admin/admin/promo
const defaultPromos: PromoCard[] = [];

// ── In-memory stores ──────────────────────────────────────────────────────────
let productStore: Product[] = [...defaultProducts];
let promoStore: PromoCard[] = [...defaultPromos];

// ── Products CRUD ─────────────────────────────────────────────────────────────
export function getProducts(): Product[] {
  return productStore;
}

export function getProductBySlug(slug: string): Product | undefined {
  return productStore.find((p) => p.slug === slug);
}

export function addProduct(data: Omit<Product, "id" | "createdAt">): Product {
  const product: Product = {
    ...data,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  productStore = [product, ...productStore];
  return product;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const idx = productStore.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  productStore[idx] = { ...productStore[idx], ...data };
  return productStore[idx];
}

export function deleteProduct(id: string): boolean {
  const prev = productStore.length;
  productStore = productStore.filter((p) => p.id !== id);
  return productStore.length < prev;
}

// ── Promos CRUD ───────────────────────────────────────────────────────────────
export function getPromos(): PromoCard[] {
  return promoStore;
}

export function addPromo(data: Omit<PromoCard, "id">): PromoCard {
  const promo: PromoCard = { ...data, id: `promo-${Date.now()}` };
  promoStore = [...promoStore, promo];
  return promo;
}

export function updatePromo(id: string, data: Partial<PromoCard>): PromoCard | null {
  const idx = promoStore.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  promoStore[idx] = { ...promoStore[idx], ...data };
  return promoStore[idx];
}

export function deletePromo(id: string): boolean {
  const prev = promoStore.length;
  promoStore = promoStore.filter((p) => p.id !== id);
  return promoStore.length < prev;
}

export function reorderPromos(ids: string[]): void {
  const map = new Map(promoStore.map((p) => [p.id, p]));
  promoStore = ids.map((id) => map.get(id)!).filter(Boolean);
}
