// lib/cart.ts
// Keranjang belanja client-side (localStorage) + event agar Navbar bisa update badge realtime.

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  /** Harga satuan dalam angka (bukan string berformat) */
  price: number;
  quantity: number;
  /** Nama tipe/varian jika dipilih */
  typeName?: string | null;
};

const CART_KEY = "mh_cart";
export const CART_EVENT = "mh_cart_change";
export const WISHLIST_EVENT = "mh_wishlist_change";

function emitCartChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_EVENT));
  }
}

export function emitWishlistChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WISHLIST_EVENT));
  }
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  emitCartChange();
}

/** Total jumlah item (akumulasi quantity) — untuk badge navbar */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

/** Tambah item; jika produk+varian sama sudah ada, quantity dijumlahkan */
export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.productId === item.productId && (c.typeName ?? null) === (item.typeName ?? null)
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function updateQuantity(productId: string, typeName: string | null, quantity: number) {
  const cart = getCart();
  const item = cart.find(
    (c) => c.productId === productId && (c.typeName ?? null) === typeName
  );
  if (!item) return;
  item.quantity = Math.max(1, quantity);
  saveCart(cart);
}

export function removeFromCart(productId: string, typeName: string | null) {
  const cart = getCart().filter(
    (c) => !(c.productId === productId && (c.typeName ?? null) === typeName)
  );
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}
