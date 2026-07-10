"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchOverlay from "@/app/(storefront)/SearchOverlay";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLinkClick() {
    setMobileOpen(false);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-[#f8f9fa]/95 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-[#064e3b]">
            <StorefrontIcon />
            <span className="text-lg font-bold sm:text-2xl">Jernih Creatife</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-bold tracking-wide transition-colors border-b-2 pb-1 hover:text-[#064e3b] ${
                    isActive
                      ? "border-[#064e3b] text-[#064e3b]"
                      : "border-transparent text-[#404944]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">
            <button
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#404944] transition hover:bg-[#e1e3e4] hover:text-[#064e3b]"
            >
              <SearchIcon />
            </button>

            {/* Burger — mobile only */}
            <button
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#404944] transition hover:bg-[#e1e3e4] hover:text-[#064e3b] md:hidden"
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
        <div className="flex items-center justify-between border-b border-[#e8ecea] px-5 py-4">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2 text-[#064e3b]"
          >
            <StorefrontIcon />
            <span className="text-base font-bold">Jernih Creatife</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#404944] hover:bg-[#f0f2f1] transition"
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
                    ? "bg-[#064e3b] text-white shadow-sm"
                    : "text-[#404944] hover:bg-[#f0f4f2] hover:text-[#064e3b]"
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
        <div className="border-t border-[#e8ecea] px-5 py-4">
          <p className="text-xs text-[#9ea8a2]">© 2025 Jernih Creatife</p>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
