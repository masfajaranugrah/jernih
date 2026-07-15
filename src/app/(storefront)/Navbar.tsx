"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SearchOverlay from "@/app/(storefront)/SearchOverlay";

interface UserData {
  name: string;
  slug: string;
}

const navLinks = [
  { label: "Beranda", href: "/", icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
  { label: "Produk", href: "/produk", icon: "M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" },
  { label: "Sewa", href: "/sewa", icon: "M12.65 10C11.83 7.67 9.59 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.59 0 4.83-1.67 5.65-4H17v3h3v-3h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" },
  { label: "Jasa", href: "/jasa", icon: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.6z" },
];

function StorefrontIcon() {
  return (
    <svg className="inline-block h-[1em] w-[1em] fill-current text-3xl" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10h16l-1-5H5l-1 5Zm1 2v8h14v-8h-2v6h-4v-6H5Zm2 0h4v6H7v-6Z" />
    </svg>
  );
}

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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mh_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

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

  function handleLogout() {
    localStorage.removeItem("mh_user");
    document.cookie = "mh_token=; path=/; max-age=0; SameSite=Lax";
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/95 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-[#1e3a8a]">
            <StorefrontIcon />
            <span className="text-lg font-bold sm:text-2xl">Jernih Creatife</span>
          </Link>

          {/* Desktop nav links — center */}
          <div className="hidden items-center justify-center gap-8 flex-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-bold tracking-wide transition-colors border-b-2 pb-1 hover:text-[#1e3a8a] ${
                    isActive
                      ? "border-[#1e3a8a] text-[#1e3a8a]"
                      : "border-transparent text-[#475569]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right: Search + Login/Register / Avatar */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#475569] transition hover:bg-[#e2e8f0] hover:text-[#1e3a8a]"
            >
              <SearchIcon />
            </button>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a8a] text-white text-sm font-bold transition hover:bg-[#1e40af]"
                >
                  {getInitial(user.name)}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50">
                    <Link
                      href={`/dashboard/pelanggan/${user.slug}/`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#0f172a] hover:bg-[#f1f5f9] transition"
                    >
                      <svg className="h-5 w-5 fill-current text-[#94a3b8]" viewBox="0 0 24 24">
                        <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0-18v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1Z" />
                      </svg>
                      Dashboard saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-[#dc2626] hover:bg-[#fecaca] transition text-left"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M5 3h6a1 1 0 0 1 1 1v2h-2V5H5v14h5v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm12.59 5.59L20.17 11H10v2h10.17l-2.58 2.59L19 17l5-5-5-5-1.41 1.59Z" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/pelanggan/login"
                  className="rounded-lg border border-[#1e3a8a] px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:bg-[#1e3a8a] hover:text-white"
                >
                  Masuk
                </Link>
                <Link
                  href="/dashboard/pelanggan/register"
                  className="rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1e40af]"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right: Search + Burger */}
          <div className="flex items-center gap-0.5 md:hidden">
            <button
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#475569] transition hover:bg-[#e2e8f0] hover:text-[#1e3a8a]"
            >
              <SearchIcon />
            </button>
            <button
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#475569] transition hover:bg-[#e2e8f0] hover:text-[#1e3a8a]"
            >
              {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Sidebar Overlay ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar drawer — slides in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] flex w-[80vw] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2 text-[#1e3a8a]"
          >
            <StorefrontIcon />
            <span className="text-base font-bold">Jernih Creatife</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#f1f5f9] transition"
            aria-label="Tutup menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#1e3a8a] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#1e3a8a]"
                }`}
              >
                <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={link.icon} />
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-[#e2e8f0] px-5 py-4 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a8a] text-white text-sm font-bold">
                  {getInitial(user.name)}
                </div>
                <span className="text-sm font-semibold text-[#0f172a] truncate">{user.name}</span>
              </div>
              <Link
                href={`/dashboard/pelanggan/${user.slug}/`}
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#0f172a] hover:bg-[#f1f5f9] transition"
              >
                <svg className="h-5 w-5 fill-current text-[#94a3b8]" viewBox="0 0 24 24">
                  <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Zm0-18v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1Z" />
                </svg>
                Dashboard saya
              </Link>
              <button
                onClick={() => { handleLogout(); handleLinkClick(); }}
                className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-[#dc2626] hover:bg-[#fecaca] transition"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M5 3h6a1 1 0 0 1 1 1v2h-2V5H5v14h5v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm12.59 5.59L20.17 11H10v2h10.17l-2.58 2.59L19 17l5-5-5-5-1.41 1.59Z" />
                </svg>
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
          <p className="text-xs text-[#94a3b8] text-center">© 2025 Jernih Creatife</p>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
