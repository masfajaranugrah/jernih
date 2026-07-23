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

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <ol className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
          <li><Link className="font-bold text-[#1e3a8a] hover:underline" href="/">Home</Link></li>
          <li><Icon className="text-base">chevron_right</Icon></li>
          <li><Link className="hover:underline hover:text-[#1e3a8a]" href="/produk">Produk</Link></li>
          <li><Icon className="text-base">chevron_right</Icon></li>
          <li aria-current="page" className="truncate font-medium text-gray-800">{product.title}</li>
        </ol>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-28 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr_340px] lg:gap-6">
          {/* ── Left: Image Gallery (sticky) ── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="relative flex h-[300px] items-center justify-center rounded-2xl bg-gray-50 p-4 md:h-[380px]">
              <Image src={gallery[activeImage]} alt={product.title} fill priority sizes="(min-width: 1024px) 480px, 100vw" className="object-contain p-6 md:p-10" />
            </div>
            <div className="scrollbar-hide mt-4 flex justify-start gap-3 overflow-x-auto pb-2">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-16 shrink-0 rounded-xl bg-white p-1 ${index === activeImage ? "border-2 border-[#1e3a8a]" : "border border-gray-200 hover:border-gray-400"}`}
                >
                  <Image src={image} alt={`${product.title} thumbnail ${index + 1}`} fill sizes="64px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          </aside>

          {/* ── Center: Product Info (scrollable) ── */}
          <section className="min-w-0">
            {/* Badge promo card */}
            {product.badge && (
              <div
                className={`mb-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white ${
                  {
                    SALE: "bg-[#ba1a1a]",
                    NEW: "bg-[#1e3a8a]",
                    HOT: "bg-orange-500",
                    DISKON: "bg-[#1e3a8a]",
                    TERBATAS: "bg-[#7c3aed]",
                  }[product.badge] ?? "bg-[#ba1a1a]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                </svg>
                {product.badge}
              </div>
            )}
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1e3a8a]">{product.category}</p>
            <h1 className="mt-1 text-xl font-black leading-tight text-gray-950 sm:text-2xl">{product.title}</h1>

            <div className="mt-3">
              <div className="text-3xl font-black tracking-tight text-gray-950">{displayPrice}</div>
              {oldPriceNum > 0 && (
                <div className="mt-1 text-xs text-gray-400 line-through">{String(displayOldPrice)}</div>
              )}
            </div>

            <div className="mt-3">
              <span className="text-sm font-bold text-orange-500">
                {activeType ? `Stok: ${displayStock}` : product.stock}
              </span>
            </div>

            {/* Type Selector */}
            {hasTypes && (
              <div className="mt-6">
                <h2 className="text-sm font-black text-gray-950">Pilih Tipe</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.types!.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTypeIdx(i); setQuantity(1); }}
                      className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                        selectedTypeIdx === i
                          ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Detail Produk */}
            <div className="mt-6">
              <h2 className="text-sm font-black text-gray-950">Detail Produk</h2>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
                {product.details.map((item) => <li key={item}>&bull; {item}</li>)}
              </ul>
            </div>

            {/* Deskripsi / Spesifikasi tabs */}
            <div className="mt-8 border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`border-b-2 pb-3 text-sm font-black ${activeTab === "description" ? "border-[#1e3a8a] text-[#1e3a8a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Deskripsi
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`border-b-2 pb-3 text-sm font-black ${activeTab === "specs" ? "border-[#1e3a8a] text-[#1e3a8a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Spesifikasi
                </button>
              </div>
            </div>

            <article className="py-5">
              {activeTab === "description" ? (
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700">{product.description}</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  {product.specs.map(([label, value], i) => (
                    <div
                      key={label}
                      className={`grid grid-cols-[160px_1fr] gap-2 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <div className="font-bold text-gray-950">{label}</div>
                      <div className="text-gray-600">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* Shipping */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3 pb-4">
                <Icon className="mt-0.5 text-[#1e3a8a]">local_shipping</Icon>
                <div>
                  <h3 className="text-sm font-bold text-gray-950">JNE Reguler</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Pengiriman andalan ke seluruh Indonesia.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4">
                <Icon className="mt-0.5 text-[#1e3a8a]">local_shipping</Icon>
                <div>
                  <h3 className="text-sm font-bold text-gray-950">SiCepat</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Pengiriman cepat ke seluruh Indonesia.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4">
                <Icon className="mt-0.5 text-[#1e3a8a]">local_shipping</Icon>
                <div>
                  <h3 className="text-sm font-bold text-gray-950">J&T Express</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Pengiriman terpercaya dengan jangkauan luas.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Right: Order Card (sticky) ── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
              <h3 className="text-sm font-black text-gray-950">Atur jumlah dan catatan</h3>

              {/* Variant */}
              {hasTypes && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600">Terpilih: <span className="font-bold text-gray-950">{activeType!.name}</span></p>
                </div>
              )}

              {/* Quantity in card */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold text-gray-700">jumlah</label>
                <div className="flex w-28 items-center rounded-lg border border-gray-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                    className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <Icon>remove</Icon>
                  </button>
                  <input
                    aria-label="Jumlah"
                    className="w-full border-none bg-transparent p-0 text-center text-sm font-bold text-gray-950 outline-none"
                    inputMode="numeric"
                    type="text"
                    value={quantity}
                    onChange={(e) => {
                      const n = Number(e.target.value.replace(/\D/g, ""));
                      setQuantity(Number.isFinite(n) && n > 0 ? n : 1);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => v + 1)}
                    className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <Icon>add</Icon>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Stok: {stockNum}</p>
              </div>

              {/* Price before discount */}
              {oldPriceNum > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>harga sebelum diskon</span>
                    <span className="line-through">{String(displayOldPrice)}</span>
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-950">Subtotal</span>
                <span className="text-lg font-black text-gray-950">{formatPrice(subtotal)}</span>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-black transition ${
                    addedToCart
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50"
                  }`}
                >
                  <Icon>add</Icon>
                  {addedToCart ? "Ditambahkan ✓" : "Keranjang"}
                </button>
                <a
                  href={whatsappUrlBuy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1e3a8a] text-sm font-black text-white transition hover:bg-[#1e40af]"
                >
                  Beli Langsung
                </a>
                <button
                  onClick={handleTanyaProduk}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  <Icon>chat</Icon>
                  Tanya Produk
                </button>
              </div>

              {/* Wishlist & Share */}
              <div className="mt-4 flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistBusy}
                  className={`flex items-center gap-1.5 text-xs font-bold transition disabled:opacity-50 ${
                    inWishlist ? "text-[#dc2626]" : "text-gray-500 hover:text-[#1e3a8a]"
                  }`}
                >
                  <svg className="inline-block h-[1em] w-[1em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    {inWishlist ? (
                      <path d="m12 21-1.5-1.3C5.4 15.1 2 12 2 8.2 2 5.1 4.4 3 7.4 3c1.7 0 3.4.8 4.6 2.1A6.1 6.1 0 0 1 16.6 3C19.6 3 22 5.1 22 8.2c0 3.8-3.4 6.9-8.5 11.5L12 21Z" />
                    ) : (
                      <path d="m12 21-1.5-1.3C5.4 15.1 2 12 2 8.2 2 5.1 4.4 3 7.4 3c1.7 0 3.4.8 4.6 2.1A6.1 6.1 0 0 1 16.6 3C19.6 3 22 5.1 22 8.2c0 3.8-3.4 6.9-8.5 11.5L12 21Zm0-2.7.1-.1C16.8 14 20 11.1 20 8.2 20 6.2 18.5 5 16.6 5c-1.5 0-3 .9-3.6 2.2h-2C10.4 5.9 8.9 5 7.4 5 5.5 5 4 6.2 4 8.2c0 2.9 3.2 5.8 7.9 10l.1.1Z" />
                    )}
                  </svg>
                  {inWishlist ? "Di Wishlist" : "Wishlist"}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShareOpen((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#1e3a8a]"
                  >
                    <Icon>share_social</Icon>
                    Share
                  </button>
                  {shareOpen && <SharePopover title={product.title} onClose={() => setShareOpen(false)} />}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
}
