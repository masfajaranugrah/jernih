"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart, emitWishlistChange } from "@/lib/cart";
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
  badge?: string | null;
  price: string;
  installment: string;
  stock: string;
  image: string;
  description: string;
  details: string[];
  specs: string[][];
  gallery: string[];
  types?: ProductType[];
};

function Icon({ children, className = "" }: { children: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    chevron_right: <path d="m9 18 6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18Z" />,
    compare_arrows: <path d="M10 3 6 7l4 4V8h10V6H10V3Zm4 10v3H4v2h10v3l4-4-4-4Z" />,
    local_shipping: <path d="M3 5h12v10h2.2l1.8-2v-3h-2V8h3l2 3v4h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2V7a2 2 0 0 1 1-2Zm3 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
    storefront: <path d="M4 10h16l-1-5H5l-1 5Zm1 2v8h14v-8h-2v6h-4v-6H5Zm2 0h4v6H7v-6Z" />,
    remove: <path d="M5 11h14v2H5v-2Z" />,
    add: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />,
    share: <path d="M18 16.1c-.8 0-1.5.3-2 .8L8.9 12.8c.1-.3.1-.5.1-.8s0-.5-.1-.8L16 7.1A3 3 0 1 0 15 5c0 .3 0 .5.1.8L8 9.9A3 3 0 1 0 8 14l7.1 4.2c-.1.2-.1.5-.1.8a3 3 0 1 0 3-2.9Z" />,
    favorite_border: <path d="m12 21-1.5-1.3C5.4 15.1 2 12 2 8.2 2 5.1 4.4 3 7.4 3c1.7 0 3.4.8 4.6 2.1A6.1 6.1 0 0 1 16.6 3C19.6 3 22 5.1 22 8.2c0 3.8-3.4 6.9-8.5 11.5L12 21Zm0-2.7.1-.1C16.8 14 20 11.1 20 8.2 20 6.2 18.5 5 16.6 5c-1.5 0-3 .9-3.6 2.2h-2C10.4 5.9 8.9 5 7.4 5 5.5 5 4 6.2 4 8.2c0 2.9 3.2 5.8 7.9 10l.1.1Z" />,
    chat: <path d="M2 22V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6l-4 4Z" />,
    whatsapp: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />,
    share_social: <path d="M18 16.1c-.8 0-1.5.3-2 .8L8.9 12.8c.1-.3.1-.5.1-.8s0-.5-.1-.8L16 7.1A3 3 0 1 0 15 5c0 .3 0 .5.1.8L8 9.9A3 3 0 1 0 8 14l7.1 4.2c-.1.2-.1.5-.1.8a3 3 0 1 0 3-2.9Z" />,
  };

  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {icons[children]}
    </svg>
  );
}

function SharePopover({ title, onClose }: { title: string; onClose: () => void }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Lihat produk ${title} di Jernih Creative`;

  const socials = [
    {
      name: "Facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "Twitter",
      color: "#1DA1F2",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "WhatsApp",
      color: "#25D366",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + url)}`,
    },
    {
      name: "LinkedIn",
      color: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram",
      color: "#26A5E4",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-1/2 z-50 mt-2 w-56 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
        <div className="flex flex-col gap-1">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill={s.color} aria-hidden="true">
                {s.name === "Facebook" ? <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> : null}
                {s.name === "Twitter" ? <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> : null}
                {s.name === "WhatsApp" ? <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /> : null}
                {s.name === "LinkedIn" ? <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> : null}
                {s.name === "Telegram" ? <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /> : null}
              </svg>
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const [quantity, setQuantity] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const hasTypes = product.types && product.types.length > 0;
  const [selectedTypeIdx, setSelectedTypeIdx] = useState(0);
  const activeType = hasTypes ? product.types![selectedTypeIdx] : null;
  const displayPrice = activeType ? activeType.price : product.price;
  const displayOldPrice = activeType?.oldPrice ?? product.installment;
  const displayStock = activeType ? activeType.stock : (() => {
    const m = product.stock.match(/\d+/);
    return m ? Number(m[0]) : 0;
  })();

  const stockNum = displayStock;
  const priceNum = Number(displayPrice.replace(/[^0-9]/g, ""));
  const oldPriceNum = displayOldPrice ? Number(String(displayOldPrice).replace(/[^0-9]/g, "")) : 0;
  const discountPercent = oldPriceNum > priceNum ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0;
  const subtotal = priceNum * quantity;

  function formatPrice(n: number) {
    return `Rp${n.toLocaleString("id-ID")}`;
  }

  const whatsappNumber = "6281318638100";
  const typeInfo = activeType ? `\nTipe: ${activeType.name}` : "";
  const whatsappUrlBuy = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo, saya ingin memesan:\n\n*${product.title}*${typeInfo}\nJumlah: ${quantity}\nHarga satuan: ${displayPrice}\nTotal: ${formatPrice(subtotal)}\n\nMohon informasi lebih lanjut. Terima kasih 🙏`,
  )}`;

  // Cek status wishlist saat mount (hanya jika sudah login)
  useEffect(() => {
    let cancelled = false;
    async function checkWishlist() {
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
    return () => { cancelled = true; };
  }, [product.id]);

  /** Tanya produk via chat in-app — bawa context produk ke halaman chat */
  function handleTanyaProduk() {
    if (!user) {
      router.push(`/dashboard/pelanggan/login?from=/produk/${product.slug}`);
      return;
    }
    const slug = user.slug ?? user.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/dashboard/pelanggan/${slug}/chat?productSlug=${product.slug}`);
  }

  async function handleToggleWishlist() {
    if (wishlistBusy) return;
    // Belum login → arahkan ke halaman login pelanggan
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
        emitWishlistChange(); // update badge navbar
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

  return (
    <div className="min-h-screen bg-[#e3e5e0] text-black w-full overflow-x-hidden">
      {/* ── MAIN HERO SHOWCASE AREA ── */}
      <main className="w-full relative">
        {/* Full-bleed Product Image Hero Container with Patented Aspect Ratio */}
        <div className="relative w-full aspect-[4/5] max-h-[480px] sm:max-h-[560px] rounded-b-[36px] sm:rounded-b-[48px] overflow-hidden bg-neutral-900 shadow-xl">
          {/* Main Product Image (Fills Entire Hero Box) */}
          <Image
            src={gallery[activeImage]}
            alt={product.title}
            fill
            priority
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover w-full h-full transition-all duration-300"
          />

          {/* Top Floating Overlay Buttons Bar */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            {/* Top-Left: Floating Back Circle Button */}
            <button
              onClick={() => router.back()}
              aria-label="Kembali"
              className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            {/* Top-Right: Floating Share & Wishlist Circle Buttons */}
            <div className="pointer-events-auto flex items-center gap-2.5">
              <div className="relative">
                <button
                  onClick={() => setShareOpen((v) => !v)}
                  aria-label="Bagikan"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 16.1c-.8 0-1.5.3-2 .8L8.9 12.8c.1-.3.1-.5.1-.8s0-.5-.1-.8L16 7.1A3 3 0 1 0 15 5c0 .3 0 .5.1.8L8 9.9A3 3 0 1 0 8 14l7.1 4.2c-.1.2-.1.5-.1.8a3 3 0 1 0 3-2.9Z" />
                  </svg>
                </button>
                {shareOpen && <SharePopover title={product.title} onClose={() => setShareOpen(false)} />}
              </div>

              <button
                onClick={handleToggleWishlist}
                disabled={wishlistBusy}
                aria-label="Wishlist"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 border border-white/40"
              >
                <svg className={`w-5 h-5 ${inWishlist ? "fill-black text-black" : "fill-none stroke-black stroke-2"}`} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Floating Dots Carousel Indicators (Floating Bottom-Center Inside Image) */}
          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Lihat foto ${index + 1}`}
                  className={`transition-all duration-300 cursor-pointer ${
                    index === activeImage
                      ? "w-5 h-2 bg-white rounded-full shadow-xs"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70 rounded-full"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── BOTTOM SHEET CARD CONTAINER ── */}
        <div className="w-full bg-white rounded-t-[36px] sm:rounded-t-[48px] -mt-6 relative z-20 px-6 sm:px-12 py-8 sm:py-10 space-y-6 border-t border-white/80 shadow-2xl">
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-2" />

          {/* Horizontal Thumbnails Row */}
          {gallery.length > 1 && (
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-white p-1 transition-all cursor-pointer ${
                    index === activeImage
                      ? "border-2 border-black shadow-md scale-105"
                      : "border border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <Image src={image} alt={`${product.title} thumbnail ${index + 1}`} fill sizes="80px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          {/* Subtitle Category + Title + Price Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mt-1">{product.title}</h1>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">{displayPrice}</span>
                {oldPriceNum > priceNum && oldPriceNum > 0 && (
                  <span className="text-sm sm:text-base text-neutral-400 line-through">{formatPrice(oldPriceNum)}</span>
                )}
              </div>
              {discountPercent > 0 && (
                <div className="mt-1">
                  <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">-{discountPercent}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Size / Variant Pill Chips — ONLY SHOWN IF PRODUCT HAS REAL TYPES */}
          {hasTypes && (
            <div className="pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">Pilih Varian / Tipe</h2>
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                {product.types!.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTypeIdx(i); setQuantity(1); }}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all shrink-0 cursor-pointer ${
                      selectedTypeIdx === i
                        ? "bg-black text-white shadow-sm"
                        : "bg-neutral-100 text-black border border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Details List if present */}
          {product.details && product.details.length > 0 && (
            <div className="pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Highlights Produk</h2>
              <ul className="space-y-1.5 text-sm font-medium text-neutral-700">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description Paragraph */}
          <div className="pt-2 border-t border-neutral-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Deskripsi Lengkap</h2>
            <p className="whitespace-pre-line text-sm text-neutral-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity selector & Chat button row */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-neutral-50 rounded-full p-1.5 border border-neutral-100">
              <button
                type="button"
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                className="w-10 h-10 rounded-full bg-neutral-100 text-black font-bold text-lg flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
              >
                −
              </button>
              <span className="font-black text-lg text-black px-2">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((v) => v + 1)}
                className="w-10 h-10 rounded-full bg-neutral-100 text-black font-bold text-lg flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              onClick={handleTanyaProduk}
              className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition flex items-center gap-2 cursor-pointer"
            >
              <Icon>chat</Icon>
              Tanya Chat
            </button>
          </div>

          {/* Action Button Row: Beli Sekarang (Hanya Beli Sekarang di dalam Card) */}
          <div className="pt-2 w-full">
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3.5 px-6 rounded-full bg-black text-white font-extrabold text-sm sm:text-base shadow-lg hover:bg-neutral-800 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.89-2-2-2z" />
              </svg>
              Beli Sekarang
            </button>
          </div>
        </div>
      </main>

      {/* ── UNIFIED SINGLE CAPSULE PILL FOR DETAIL BOTTOM NAVBAR (HANYA TAMBAHKAN KE KERANJANG) ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center select-none">
        <button
          onClick={handleAddToCart}
          className="bg-white rounded-full p-1.5 pr-7 border border-black/10 flex items-center gap-3 text-black hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
            </svg>
          </span>
          <span className="font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap">
            {addedToCart ? "Ditambahkan ✓" : "Add to cart"}
          </span>
        </button>
      </div>
    </div>
  );
}

