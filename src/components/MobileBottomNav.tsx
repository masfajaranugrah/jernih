"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCartCount, CART_EVENT, WISHLIST_EVENT } from "@/lib/cart";

function StackIcon() {
  return (
    <svg className="w-6 h-6 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4" width="14" height="3.5" rx="1.5" />
      <rect x="5" y="10.25" width="14" height="3.5" rx="1.5" />
      <rect x="5" y="16.5" width="14" height="3.5" rx="1.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-6 h-6 fill-black shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg className="w-6 h-6 fill-black shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-6 h-6 fill-black shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userSlug = user?.slug ?? user?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const isDetailPage =
    (pathname.startsWith("/produk/") && pathname !== "/produk") ||
    (pathname.startsWith("/sewa/") && pathname !== "/sewa") ||
    (pathname.startsWith("/jasa/") && pathname !== "/jasa");

  useEffect(() => {
    setCartCount(getCartCount());
    const syncCart = () => setCartCount(getCartCount());
    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setWishlistCount(data.length);
        }
      } catch {}
    }
    fetchWishlist();
    window.addEventListener(WISHLIST_EVENT, fetchWishlist);
    return () => {
      cancelled = true;
      window.removeEventListener(WISHLIST_EVENT, fetchWishlist);
    };
  }, [user]);

  if (isDetailPage) {
    return null;
  }

  const wishlistHref = user
    ? `/dashboard/pelanggan/${userSlug}/wishlist`
    : "/dashboard/pelanggan/login?from=wishlist";

  const profileHref = user
    ? `/dashboard/pelanggan/${userSlug}/profile`
    : "/dashboard/pelanggan/login";

  const isWishlistActive = pathname.includes("wishlist");
  const isCartActive = pathname.startsWith("/keranjang");
  const isProfileActive = pathname.includes("profile") || pathname.includes("dashboard/pelanggan");

  // 4 circular menu items forming a wide radial arc above trigger button
  const radialItems = [
    {
      href: "/",
      label: "Beranda",
      icon: "🏠",
      isActive: pathname === "/",
      offset: { x: -75, y: -65 },
    },
    {
      href: "/produk",
      label: "Produk",
      icon: "📦",
      isActive: pathname.startsWith("/produk"),
      offset: { x: -35, y: -135 },
    },
    {
      href: "/sewa",
      label: "Sewa",
      icon: "🛋️",
      isActive: pathname.startsWith("/sewa"),
      offset: { x: 40, y: -135 },
    },
    {
      href: "/jasa",
      label: "Jasa",
      icon: "🛠️",
      isActive: pathname.startsWith("/jasa"),
      offset: { x: 85, y: -65 },
    },
  ];

  return (
    <>
      {/* Semi-transparent Backdrop when radial menu is open */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Floating Bottom Navbar Container */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 select-none">
        {/* Left Trigger Button Wrapper with Arc/Radial Items */}
        <div className="relative flex items-center justify-center">
          {/* 4 Radial Circular Items in semi-circle arc */}
          {radialItems.map((item, idx) => {
            const transformStyle = menuOpen
              ? `translate(${item.offset.x}px, ${item.offset.y}px) scale(1)`
              : `translate(0px, 0px) scale(0)`;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  transform: transformStyle,
                  transitionDelay: menuOpen ? `${idx * 40}ms` : `${(3 - idx) * 30}ms`,
                }}
                className={`absolute z-50 flex flex-col items-center justify-center transition-all duration-300 ease-out ${
                  menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                    item.isActive
                      ? "bg-white text-black border-2 border-black shadow-black/30"
                      : "bg-black text-white border border-white/20 shadow-black/50 hover:bg-neutral-900"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                </div>
                <span className="mt-1 bg-black/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20 shadow-md whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Main Trigger Button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu Navigasi"
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center shadow-2xl transition-all duration-300 shrink-0 cursor-pointer ${
              menuOpen
                ? "bg-black border-2 border-blue-500 ring-4 ring-blue-500/20 scale-105"
                : "bg-black border border-black hover:scale-105 active:scale-95 shadow-black/40"
            }`}
          >
            {menuOpen ? <CloseIcon /> : <StackIcon />}
          </button>
        </div>

        {/* Right Element: White Pill Container */}
        <nav className="bg-white rounded-full px-6 py-3.5 shadow-2xl shadow-black/20 border border-black/10 flex items-center gap-7 sm:gap-9 text-black">
          {/* Wishlist Link (Heart) */}
          <Link
            href={wishlistHref}
            aria-label="Wishlist"
            className="relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          >
            <HeartIcon />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-black text-white text-[10px] font-extrabold h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
            {isWishlistActive && (
              <span className="absolute -bottom-1.5 w-1 h-1 bg-black rounded-full" />
            )}
          </Link>

          {/* Cart Link (Shopping Bag) */}
          <Link
            href="/keranjang"
            aria-label="Keranjang Belanja"
            className="relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          >
            <ShoppingBagIcon />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-black text-white text-[10px] font-extrabold h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
            {isCartActive && (
              <span className="absolute -bottom-1.5 w-1 h-1 bg-black rounded-full" />
            )}
          </Link>

          {/* Settings / Profile Link (Gear) */}
          <Link
            href={profileHref}
            aria-label="Pengaturan / Profil"
            className="relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          >
            <GearIcon />
            {isProfileActive && (
              <span className="absolute -bottom-1.5 w-1 h-1 bg-black rounded-full" />
            )}
          </Link>
        </nav>
      </div>
    </>
  );
}
