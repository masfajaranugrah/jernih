"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SearchOverlay from "@/app/(storefront)/SearchOverlay";
import { getCartCount, CART_EVENT, WISHLIST_EVENT } from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Beranda", href: "/", icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
  { label: "Produk", href: "/produk", icon: "M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" },
  { label: "Sewa", href: "/sewa", icon: "M12.65 10C11.83 7.67 9.59 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.59 0 4.83-1.67 5.65-4H17v3h3v-3h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" },
  { label: "Jasa", href: "/jasa", icon: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.6z" },
];

/* ───────── Icon components ───────── */

function SearchIcon() {
  return (
    <svg className="inline-block h-[1.4em] w-[1.4em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m19.6 21-6.3-6.3a7 7 0 1 1 1.4-1.4l6.3 6.3-1.4 1.4ZM9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="inline-block h-[1.4em] w-[1.4em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 21-1.5-1.3C5.4 15.1 2 12 2 8.2 2 5.1 4.4 3 7.4 3c1.7 0 3.4.8 4.6 2.1A6.1 6.1 0 0 1 16.6 3C19.6 3 22 5.1 22 8.2c0 3.8-3.4 6.9-8.5 11.5L12 21Zm0-2.7.1-.1C16.8 14 20 11.1 20 8.2 20 6.2 18.5 5 16.6 5c-1.5 0-3 .9-3.6 2.2h-2C10.4 5.9 8.9 5 7.4 5 5.5 5 4 6.2 4 8.2c0 2.9 3.2 5.8 7.9 10l.1.1Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="inline-block h-[1.4em] w-[1.4em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2ZM1 2v2h2l3.6 7.6-1.4 2.4c-.7 1.3.3 3 1.8 3h12v-2H7l1.1-2h7.4c.8 0 1.4-.4 1.8-1l3.6-6.5c.4-.7-.1-1.5-.9-1.5H5.2L4.3 2H1Zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z" />
    </svg>
  );
}

function IconWithBadge({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      {children}
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-black leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

function DashboardIcon() {
  return (
    <svg className="h-5 w-5 fill-current text-[#94a3b8]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0-18v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h6a1 1 0 0 1 1 1v2h-2V5H5v14h5v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm12.59 5.59L20.17 11H10v2h10.17l-2.58 2.59L19 17l5-5-5-5-1.41 1.59Z" />
    </svg>
  );
}

/* ───────── Shared styles ───────── */

const DESKTOP_ICON_BTN =
  "flex h-10 w-10 items-center justify-center rounded-full text-[#475569] transition hover:bg-[#e2e8f0] hover:text-[#1e3a8a]";

/* ───────── Navbar component ───────── */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derived user info dari AuthContext (API-based, bukan localStorage)
  const user = authUser
    ? { name: authUser.name, slug: authUser.slug ?? authUser.name.toLowerCase().replace(/\s+/g, '-') }
    : null;

  /* ── Sync cart badge ── */
  useEffect(() => {
    setCartCount(getCartCount());
    const sync = () => setCartCount(getCartCount());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /* ── Sync wishlist badge ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchWishlistCount() {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setWishlistCount(0);
          return;
        }
        const data = await res.json();
        if (!cancelled) setWishlistCount(Array.isArray(data) ? data.length : 0);
      } catch {
        if (!cancelled) setWishlistCount(0);
      }
    }
    fetchWishlistCount();
    window.addEventListener(WISHLIST_EVENT, fetchWishlistCount);
    return () => {
      cancelled = true;
      window.removeEventListener(WISHLIST_EVENT, fetchWishlistCount);
    };
  }, [user]);

  /* ── Click outside to close dropdown ── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLinkClick() {
    setMobileOpen(false);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // tetap lanjut hapus local storage meski API gagal
    }
    document.cookie = "mh_token=; path=/; max-age=0; SameSite=Lax";
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  const wishlistHref = user
    ? `/dashboard/pelanggan/${user.slug}/wishlist`
    : "/dashboard/pelanggan/login?from=wishlist";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-[#e2e8f0] bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-3 sm:px-6 lg:px-8">
          {/* ── Logo (kiri) ── */}
          <Link href="/" className="flex justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Jernih Creatife" className="h-8 w-auto sm:h-9" />
          </Link>

          {/* ── Desktop nav links (tengah) ── */}
          <div className="hidden justify-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition-all hover:bg-[#f1f5f9] hover:text-[#1e3a8a] ${
                  isActive(link.href)
                    ? "bg-[#eef2ff] text-[#1e3a8a]"
                    : "text-[#475569]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop right section (kanan) ── */}
          <div className="hidden items-center justify-end gap-0.5 md:flex">
            <button aria-label="Cari" onClick={() => setSearchOpen(true)} className={DESKTOP_ICON_BTN}>
              <SearchIcon />
            </button>
            <Link aria-label="Wishlist" href={wishlistHref} className={DESKTOP_ICON_BTN}>
              <IconWithBadge count={wishlistCount}>
                <HeartIcon />
              </IconWithBadge>
            </Link>
            <Link aria-label="Keranjang" href="/keranjang" className={DESKTOP_ICON_BTN}>
              <IconWithBadge count={cartCount}>
                <CartIcon />
              </IconWithBadge>
            </Link>

            {/* Avatar / Auth buttons */}
            {user ? (
              <div className="relative ml-3" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white shadow-sm transition hover:bg-[#1e40af] hover:shadow-md"
                >
                  {getInitial(user.name)}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-50">
                    <Link
                      href={`/dashboard/pelanggan/${user.slug}/`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f1f5f9]"
                    >
                      <DashboardIcon />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#dc2626] transition hover:bg-[#fecaca]"
                    >
                      <LogoutIcon />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-2">
                <Link
                  href="/dashboard/pelanggan/login"
                  className="rounded-lg border border-[#1e3a8a] px-4 py-2 text-sm font-semibold text-[#1e3a8a] transition hover:bg-[#1e3a8a] hover:text-white"
                >
                  Masuk
                </Link>
                <Link
                  href="/dashboard/pelanggan/register"
                  className="rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af] hover:shadow-md"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile right section ── */}
          <div className="flex items-center gap-0 md:hidden">
            <button aria-label="Cari" onClick={() => setSearchOpen(true)} className={DESKTOP_ICON_BTN}>
              <SearchIcon />
            </button>
            <Link aria-label="Wishlist" href={wishlistHref} className={DESKTOP_ICON_BTN}>
              <IconWithBadge count={wishlistCount}>
                <HeartIcon />
              </IconWithBadge>
            </Link>
            <Link aria-label="Keranjang" href="/keranjang" className={DESKTOP_ICON_BTN}>
              <IconWithBadge count={cartCount}>
                <CartIcon />
              </IconWithBadge>
            </Link>
            <button
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className={DESKTOP_ICON_BTN}
            >
              {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile sidebar backdrop ── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile sidebar drawer ── */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
          <Link href="/" onClick={handleLinkClick} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Jernih Creatife" className="h-8 w-auto" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className={DESKTOP_ICON_BTN}
            aria-label="Tutup menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Sidebar nav links — scrollable */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                isActive(link.href)
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#1e3a8a]"
              }`}
            >
              <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d={link.icon} />
              </svg>
              {link.label}
            </Link>
          ))}

          <hr className="my-2 border-[#e2e8f0]" />

          <Link
            href={wishlistHref}
            onClick={handleLinkClick}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-[#475569] transition-all hover:bg-[#f1f5f9] hover:text-[#1e3a8a]"
          >
            <span className="flex items-center gap-4">
              <HeartIcon />
              Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-[11px] font-black text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/keranjang"
            onClick={handleLinkClick}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-[#475569] transition-all hover:bg-[#f1f5f9] hover:text-[#1e3a8a]"
          >
            <span className="flex items-center gap-4">
              <CartIcon />
              Keranjang
            </span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-[11px] font-black text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Sidebar footer — auth */}
        <div className="border-t border-[#e2e8f0] px-5 py-4">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
                  {getInitial(user.name)}
                </div>
                <span className="truncate text-sm font-semibold text-[#0f172a]">{user.name}</span>
              </div>
              <Link
                href={`/dashboard/pelanggan/${user.slug}/`}
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f1f5f9]"
              >
                <DashboardIcon />
                Dashboard saya
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-[#dc2626] transition hover:bg-[#fecaca]"
              >
                <LogoutIcon />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/dashboard/pelanggan/login"
                onClick={handleLinkClick}
                className="flex-1 rounded-xl border border-[#1e3a8a] py-2.5 text-center text-sm font-bold text-[#1e3a8a] transition hover:bg-[#1e3a8a] hover:text-white"
              >
                Masuk
              </Link>
              <Link
                href="/dashboard/pelanggan/register"
                onClick={handleLinkClick}
                className="flex-1 rounded-xl bg-[#1e3a8a] py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#1e40af]"
              >
                Daftar
              </Link>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-[#94a3b8]">© 2025 Jernih Creatife</p>
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
