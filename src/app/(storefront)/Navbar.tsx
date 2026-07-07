"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchOverlay from "@/app/(storefront)/SearchOverlay";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Sewa", href: "/sewa" },
  { label: "Jasa", href: "/jasa" },
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
    <svg className="inline-block h-[1em] w-[1em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m19.6 21-6.3-6.3a7 7 0 1 1 1.4-1.4l6.3 6.3-1.4 1.4ZM9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="inline-block h-[1em] w-[1em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0H4Z" />
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
      <nav className="sticky top-0 z-50 w-full bg-[#f8f9fa]/90 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-[#064e3b]">
            <StorefrontIcon />
            <span className="text-xl font-bold sm:text-2xl">Jernih Creatife</span>
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
                  className={`text-sm font-bold tracking-wide transition-colors hover:text-[#064e3b] ${
                    isActive
                      ? "border-b-2 border-[#064e3b] pb-1 text-[#064e3b]"
                      : "text-[#404944]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-[#404944] transition hover:bg-[#e1e3e4] hover:text-[#064e3b]"
            >
              <SearchIcon />
            </button>
            {/* <button
              aria-label="Akun"
              className="rounded-full p-2 text-[#404944] transition hover:bg-[#e1e3e4] hover:text-[#064e3b]"
            >
              <PersonIcon />
            </button> */}

            {/* Burger — mobile only */}
            <button
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-full p-2 text-[#404944] transition hover:bg-[#e1e3e4] hover:text-[#064e3b] md:hidden"
            >
              {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="border-t border-[#e1e3e4] bg-white px-4 py-3 md:hidden">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                        isActive
                          ? "bg-[#064e3b] text-white"
                          : "text-[#404944] hover:bg-[#f3f4f5] hover:text-[#064e3b]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Divider + akun */}
            {/* <div className="mt-3 border-t border-[#e1e3e4] pt-3">
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#404944] hover:bg-[#f3f4f5] hover:text-[#064e3b] transition-colors"
              >
                <PersonIcon />
                Masuk / Daftar
              </Link>
            </div> */}
          </div>
        )}
      </nav>

      {/* Overlay backdrop saat mobile menu terbuka */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
