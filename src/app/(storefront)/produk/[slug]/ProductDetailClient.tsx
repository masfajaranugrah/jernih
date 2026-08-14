"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart, emitWishlistChange } from "@/lib/cart";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

type ProductType = {
  id: string;
  name: string;
  price: string;
  oldPrice: string | null;
  stock: number;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  category: string;
  brand?: string | null;
  sku?: string | null;
  badge?: string | null;
  price: string;
  installment: string;
  stock: string;
  image: string;
  description: string;
  details: string[];
  specs?: Record<string, string> | null;
  gallery: string[];
  types?: ProductType[];
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "info">("description");
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.image || "/placeholder.png"];
  const hasTypes = product.types && product.types.length > 0;
  const [selectedTypeIdx, setSelectedTypeIdx] = useState(0);
  const activeType = hasTypes ? product.types![selectedTypeIdx] : null;

  const displayPrice = activeType ? activeType.price : product.price;
  const displayOldPrice = activeType?.oldPrice ?? product.installment;
  const displayStock = activeType ? activeType.stock : (() => {
    const m = product.stock.match(/\d+/);
    return m ? Number(m[0]) : 10;
  })();

  const priceNum = Number(displayPrice.replace(/[^0-9]/g, ""));
  const oldPriceNum = displayOldPrice ? Number(String(displayOldPrice).replace(/[^0-9]/g, "")) : 0;
  const discountAmount = oldPriceNum > priceNum ? oldPriceNum - priceNum : 0;
  const discountPercent = oldPriceNum > priceNum ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;
  const subtotalNum = priceNum * quantity;
  const oldSubtotalNum = oldPriceNum * quantity;

  function formatPrice(n: number) {
    return `Rp${n.toLocaleString("id-ID")}`;
  }

  // Handle scroll listener untuk tombol Scroll-to-Top
  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cek status wishlist saat mount (hanya jika sudah login)
  useEffect(() => {
    let cancelled = false;
    async function checkWishlist() {
      if (!getToken()) return;
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setInWishlist(data.some((w: { productId: string }) => w.productId === product.id));
        }
      } catch {}
    }
    checkWishlist();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  async function handleToggleWishlist() {
    if (wishlistBusy) return;
    if (!user) {
      router.push(`/dashboard/pelanggan/login?from=/produk/${product.slug}`);
      return;
    }
    setWishlistBusy(true);
    try {
      const res = inWishlist
        ? await fetch(`/api/wishlist/${product.id}`, { method: "DELETE" })
        : await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          });
      if (res.status === 401) {
        router.push(`/dashboard/pelanggan/login?from=/produk/${product.slug}`);
        return;
      }
      if (res.ok) {
        setInWishlist((v) => !v);
        emitWishlistChange();
      }
    } catch {} finally {
      setWishlistBusy(false);
    }
  }

  function handleAddToCart() {
    if (!user) {
      router.push(`/dashboard/pelanggan/login?from=/produk/${product.slug}`);
      return;
    }
    addToCart({
      productId: product.id,
      name: product.title,
      slug: product.slug,
      image: product.image,
      price: priceNum,
      quantity,
      typeName: activeType?.name ?? null,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  /** Beli Sekarang — tambah ke keranjang lalu langsung ke halaman keranjang */
  function handleBuyNow() {
    if (!user) {
      router.push(`/dashboard/pelanggan/login?from=/produk/${product.slug}`);
      return;
    }
    addToCart({
      productId: product.id,
      name: product.title,
      slug: product.slug,
      image: product.image,
      price: priceNum,
      quantity,
      typeName: activeType?.name ?? null,
    });
    router.push("/keranjang");
  }

  /** Tanya produk via chat in-app — bawa context produk ke halaman chat */
  function handleTanyaProduk() {
    if (!user) {
      router.push(`/dashboard/pelanggan/login?from=/produk/${product.slug}`);
      return;
    }
    const slug = user.slug ?? user.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/dashboard/pelanggan/${slug}/chat?productSlug=${product.slug}`);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Brand: gunakan dari marker jika ada, fallback ke "-"
  const brandName = product.brand ? product.brand.toUpperCase() : "-";
  // SKU: gunakan dari marker jika ada, fallback ke generate dari ID
  const skuCode = product.sku || `CD${product.id.slice(0, 3).toUpperCase()}888`.slice(0, 6);

  // Parse spesifikasi dinamis
  const customSpecsList: [string, string][] = [];
  if (product.specs && typeof product.specs === "object") {
    Object.entries(product.specs).forEach(([k, v]) => {
      if (v && String(v).trim()) {
        customSpecsList.push([k, String(v).trim()]);
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 w-full overflow-x-hidden font-sans">
      {/* ── BREADCRUMB & BACK HEADER ── */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali</span>
          </button>
          <div className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
            <Link href="/" className="hover:underline">Home</Link> / <Link href="/produk" className="hover:underline">Produk</Link> / <span className="text-slate-700 font-semibold">{product.category}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-28 sm:pb-32 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 lg:items-start">
          
          {/* ── 1. KIRI: GAMBAR UTAMA & GALERI THUMBNAILS (col-span-6 di desktop) ── */}
          <div className="lg:col-span-6 flex flex-col lg:sticky lg:top-16">
            {/* Frame Utama Gambar Produk (Match Screenshot 1) */}
            <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <Image
                src={gallery[activeImage]}
                alt={product.title}
                fill
                priority
                sizes="(min-width: 1024px) 500px, 100vw"
                className="object-cover transition-all duration-300"
              />
            </div>

            {/* Baris Thumbnails Gambar (Match Screenshot 1) */}
            {gallery.length > 0 && (
              <div className="flex items-center gap-2.5 mt-3 overflow-x-auto scrollbar-none py-1">
                {gallery.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 rounded-xl bg-white p-1 transition-all cursor-pointer ${
                      activeImage === idx
                        ? "border-2 border-[#5E3CF6] shadow-xs"
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="70px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. KANAN / BAWAH: DETAIL PRODUK & AKSI PEMBELIAN (col-span-6 di desktop) ── */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-4">
            
            {/* Judul Produk (Match Screenshot 1 & 2) */}
            <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight leading-snug uppercase">
              {product.title}
            </h1>

            {/* Baris Rating & Status Stok (Match Screenshot 1 & 2) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">(4.9)</span>
                
                {/* 5 Bintang Emas */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>

                <span className="text-slate-500 font-medium">(0 review produk)</span>
              </div>

              {/* Status In Stock / Stok Tersedia (Match Screenshot 2) */}
              <div className="flex items-center gap-1 text-slate-800 text-xs sm:text-sm font-semibold ml-auto sm:ml-4">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  ✓
                </span>
                <span className="text-slate-800">{displayStock > 0 ? "In Stock" : "Stok Habis"}</span>
              </div>
            </div>

            {/* Harga Produk & Diskon Badge Pill (Match Screenshot 2) */}
            <div className="pt-1">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {displayPrice}
                </span>

                {oldPriceNum > priceNum && oldPriceNum > 0 && (
                  <>
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                      {formatPrice(oldPriceNum)}
                    </span>
                    <span className="bg-[#5E3CF6] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                      - {discountAmount > 0 ? formatPrice(discountAmount) : `${discountPercent}%`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Meta Informasi (Brand, Kategori, SKU) (Match Screenshot 2) */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 flex-wrap py-2 border-y border-slate-200/80">
              <div>
                <span>Brand: </span>
                <span className="text-[#5E3CF6] font-bold">{brandName}</span>
              </div>
              <div className="h-3.5 w-px bg-slate-300" />
              <div>
                <span>Kategori: </span>
                <span className="text-[#5E3CF6] font-bold">{product.category}</span>
              </div>
              <div className="h-3.5 w-px bg-slate-300" />
              <div>
                <span>SKU: </span>
                <span className="text-slate-700 font-medium">{skuCode}</span>
              </div>
            </div>

            {/* Varian / Tipe Pilihan (jika ada) */}
            {hasTypes && (
              <div className="py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Varian / Tipe:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.types!.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTypeIdx(i);
                        setQuantity(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        selectedTypeIdx === i
                          ? "bg-[#5E3CF6] text-white border-[#5E3CF6] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── SUBTOTAL & BARIS AKSI (Match Screenshot 2) ── */}
            <div className="py-1 space-y-3">
              <div className="flex items-baseline gap-2.5 text-xs sm:text-sm">
                <span className="font-bold text-slate-900 text-sm sm:text-base">Subtotal:</span>
                <span className="text-lg sm:text-xl font-black text-slate-900">{formatPrice(subtotalNum)}</span>
                {oldSubtotalNum > subtotalNum && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    {formatPrice(oldSubtotalNum)}
                  </span>
                )}
              </div>

              {/* Baris Tombol Aksi: Quantity Box + Red Cart Button + Wishlist Heart */}
              <div className="flex items-center gap-2.5">
                {/* Selector Jumlah ( - 1 + ) */}
                <div className="flex items-center border border-slate-300 bg-white rounded-lg overflow-hidden shadow-2xs h-10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                    className="w-8 sm:w-9 h-full flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer text-base select-none"
                  >
                    −
                  </button>
                  <span className="w-8 sm:w-10 text-center font-extrabold text-slate-900 text-xs sm:text-sm select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => Math.min(displayStock, v + 1))}
                    className="w-8 sm:w-9 h-full flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer text-base select-none"
                  >
                    +
                  </button>
                </div>

                {/* Red Add to Cart Button (Match Screenshot 2) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-10 px-4 bg-[#5E3CF6] hover:bg-[#4c30d4] active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-xs flex items-center justify-center gap-2 transition cursor-pointer select-none shrink-0"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.89-2-2-2z" />
                  </svg>
                  {addedToCart && <span>Berhasil ✓</span>}
                </button>

                {/* Wishlist Heart Button (Match Screenshot 2) */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  disabled={wishlistBusy}
                  aria-label="Wishlist"
                  className="w-10 h-10 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center shadow-2xs transition cursor-pointer shrink-0 active:scale-95"
                >
                  <svg
                    className={`w-5 h-5 ${
                      inWishlist ? "fill-[#5E3CF6] text-[#5E3CF6]" : "fill-none stroke-slate-600 stroke-2"
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              {/* Tanya Chat button (Match Screenshot 2) */}
              <button
                type="button"
                onClick={handleTanyaProduk}
                className="w-full h-10 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-[0.98]"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 22V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6l-4 4Z" />
                </svg>
                Tanya Chat
              </button>
            </div>

            {/* ── TABS DESKRIPSI & INFO (Match Screenshot 2) ── */}
            <div className="pt-3 border-t border-slate-200">
              {/* Tab Navigation Header */}
              <div className="flex items-center border-b border-slate-200 gap-6">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-2.5 text-sm sm:text-base font-bold transition-all cursor-pointer relative ${
                    activeTab === "description"
                      ? "text-[#5E3CF6] border-b-2 border-[#5E3CF6]"
                      : "text-slate-600 hover:text-slate-900 border-b-2 border-transparent"
                  }`}
                >
                  Deskripsi
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`pb-2.5 text-sm sm:text-base font-bold transition-all cursor-pointer relative ${
                    activeTab === "info"
                      ? "text-[#5E3CF6] border-b-2 border-[#5E3CF6]"
                      : "text-slate-600 hover:text-slate-900 border-b-2 border-transparent"
                  }`}
                >
                  Info
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="py-4 space-y-4">
                {activeTab === "description" ? (
                  <div>
                    {/* Spesifikasi Subheader */}
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-2.5">
                      SPESIFIKASI
                    </h3>
                    <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                      {customSpecsList.length > 0 ? (
                        <>
                          {brandName !== "-" && !customSpecsList.some(([k]) => k.toLowerCase() === "brand") && (
                            <p><span className="text-slate-500">Brand:</span> <span className="font-semibold text-slate-800">{brandName}</span></p>
                          )}
                          <p><span className="text-slate-500">Kategori:</span> <span className="font-semibold text-slate-800">{product.category}</span></p>
                          {customSpecsList.map(([key, val]) => (
                            <p key={key}><span className="text-slate-500">{key}:</span> <span className="font-semibold text-slate-800">{val}</span></p>
                          ))}
                        </>
                      ) : (
                        <>
                          {brandName !== "-" && (
                            <p><span className="text-slate-500">Brand:</span> <span className="font-semibold text-slate-800">{brandName}</span></p>
                          )}
                          <p><span className="text-slate-500">Kategori:</span> <span className="font-semibold text-slate-800">{product.category}</span></p>
                          <p><span className="text-slate-500">SKU:</span> <span className="font-semibold text-slate-800">{skuCode}</span></p>
                          <p><span className="text-slate-500">Kondisi:</span> <span className="font-semibold text-slate-800">Baru (Original)</span></p>
                        </>
                      )}
                    </div>

                    {/* Deskripsi Teks — render HTML dari rich text editor */}
                    <div
                      className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-3 border-t border-slate-100 mt-3
                        [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3
                        [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1.5 [&_h2]:mt-2.5
                        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5
                        [&_li]:my-0.5
                        [&_a]:text-blue-600 [&_a]:underline
                        [&_p]:my-1.5 [&_p]:leading-relaxed
                        [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through
                        [&_br]:block [&_br]:content-[''] [&_br]:mt-1
                        [&_span]:inline break-words"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <p className="font-bold text-slate-900 mb-1">📦 Informasi Pengiriman & Garansi</p>
                      <p className="text-slate-600 leading-relaxed">
                        Produk 100% Original & Bergaransi Resmi. Dikirim aman menggunakan bubble wrap tebal dan asuransi pengiriman.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <p className="font-bold text-slate-900 mb-1">🔄 Kebijakan Pengembalian</p>
                      <p className="text-slate-600 leading-relaxed">
                        Wajib menyertakan video unboxing utuh tanpa jeda untuk klaim garansi atau penukaran produk.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── FLOATING SCROLL TO TOP BUTTON (Match Screenshot 2) ── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke Atas"
          className="fixed bottom-6 right-6 z-40 bg-[#5E3CF6] hover:bg-[#4c30d4] active:scale-95 text-white p-3 rounded-lg shadow-lg transition cursor-pointer border border-white/20"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </button>
      )}

      {/* ── UNIFIED SINGLE CAPSULE PILL FOR DETAIL BOTTOM NAVBAR (HANYA TAMBAHKAN KE KERANJANG) ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center select-none">
        <button
          onClick={handleBuyNow}
          className="bg-white rounded-full p-1.5 pr-7 border border-black/10 flex items-center gap-3 text-black hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer group shadow-md"
        >
          <span className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.89-2-2-2z" />
            </svg>
          </span>
          <span className="font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap">
            Beli Sekarang
          </span>
        </button>
      </div>
    </div>
  );
}
