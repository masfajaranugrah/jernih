"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarPelangganProps {
  nama: string;
  displayName?: string;
}

export default function SidebarPelanggan({ nama, displayName }: SidebarPelangganProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/dashboard/pelanggan/${nama}/orders`, icon: "shopping_bag", label: "Orders" },
    { href: `/dashboard/pelanggan/${nama}/wishlist`, icon: "favorite", label: "Wishlist" },
    { href: `/dashboard/pelanggan/${nama}/vouchers`, icon: "confirmation_number", label: "Vouchers" },
    { href: `/dashboard/pelanggan/${nama}/chat`, icon: "chat", label: "Chat" },
    { href: `/dashboard/pelanggan/${nama}/bantuan`, icon: "support_agent", label: "Bantuan" },
    { href: `/dashboard/pelanggan/${nama}/addresses`, icon: "location_on", label: "Addresses" },
  ];

  const bottomItems = [
    { href: `/dashboard/pelanggan/${nama}/profile`, icon: "person", label: "Profile" },
  ];

  const isActive = (href: string) =>
    href === `/dashboard/pelanggan/${nama}`
      ? pathname === href
      : pathname.startsWith(href);

  return (
    /* Desktop-only sidebar — mobile nav is handled by MobileBottomNav */
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-white flex-col z-50"
      style={{ borderRight: "1px solid #E2E8F0" }}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <Link href="/" className="inline-flex flex-col gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Ecco Market" className="h-8 w-auto" />
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#64748B", letterSpacing: "0.12em" }}>
            Dashboard
          </span>
        </Link>
      </div>

      {/* ── User greeting ──────────────────────────────────────── */}
      {(displayName || nama) && (
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: "#EFF6FF", color: "#2563EB" }}
            >
              {(displayName || nama).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs" style={{ color: "#64748B" }}>Hai,</p>
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#0F172A" }}
              >
                {displayName || nama}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main nav ───────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              {/* Left border accent for active state */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "#2563EB" }}
                />
              )}

              <span
                className="material-symbols-outlined text-[20px] leading-none flex-shrink-0"
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1", color: "#2563EB" }
                    : { fontVariationSettings: "'FILL' 0", color: "#64748B" }
                }
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: Profile ────────────────────────────────────── */}
      <div
        className="px-3 py-3 flex flex-col gap-0.5"
        style={{ borderTop: "1px solid #E2E8F0" }}
      >
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "#2563EB" }}
                />
              )}

              <span
                className="material-symbols-outlined text-[20px] leading-none flex-shrink-0"
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1", color: "#2563EB" }
                    : { fontVariationSettings: "'FILL' 0", color: "#64748B" }
                }
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
