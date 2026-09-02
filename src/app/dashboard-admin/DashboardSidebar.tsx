"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { removeToken } from "@/lib/auth";

// ─── Menu structure ──────────────────────────────────────────────────────────

const menuGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard-admin", icon: "dashboard", label: "Dashboard" },
      { href: "/dashboard-admin/orders", icon: "shopping_bag", label: "Pesanan" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/dashboard-admin/admin/products", icon: "inventory_2", label: "Produk" },
      { href: "/dashboard-admin/admin/categories", icon: "category", label: "Kategori" },
      { href: "/dashboard-admin/admin/promo", icon: "local_offer", label: "Promo" },
      { href: "/dashboard-admin/vouchers", icon: "confirmation_number", label: "Vouchers" },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/dashboard-admin/admin/services", icon: "design_services", label: "Jasa" },
      { href: "/dashboard-admin/admin/rentals", icon: "handyman", label: "Sewa" },
    ],
  },
  {
    label: "Customer",
    items: [
      { href: "/dashboard-admin/chat", icon: "chat", label: "Chat" },
      { href: "/dashboard-admin/tickets", icon: "support_agent", label: "Bantuan Tiket" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard-admin/payments", icon: "receipt_long", label: "Payments" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard-admin/admin/homepage", icon: "tune", label: "Homepage" },
      { href: "/dashboard-admin/admin/hero", icon: "image", label: "Hero Banner" },
      { href: "/dashboard-admin/admin/toko", icon: "storefront", label: "Info Toko" },
      { href: "/dashboard-admin/reviews", icon: "rate_review", label: "Reviews" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard-admin/settings", icon: "settings", label: "Settings" },
    ],
  },
];

// Items shown in the mobile bottom nav (most important)
const mobileNavItems = [
  { href: "/dashboard-admin", icon: "dashboard", label: "Dashboard" },
  { href: "/dashboard-admin/orders", icon: "shopping_bag", label: "Pesanan" },
  { href: "/dashboard-admin/admin/products", icon: "inventory_2", label: "Produk" },
  { href: "/dashboard-admin/chat", icon: "chat", label: "Chat" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard-admin") {
    return pathname === "/dashboard-admin";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── NavLink ─────────────────────────────────────────────────────────────────

function NavLink({
  href,
  icon,
  label,
  pathname,
}: {
  href: string;
  icon: string;
  label: string;
  pathname: string;
}) {
  const active = isActive(href, pathname);

  return (
    <Link
      href={href}
      prefetch={false}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-[#EFF6FF] text-[#2563EB] border-l-2 border-[#2563EB] pl-[10px]"
          : "text-[#64748B] hover:bg-slate-50 hover:text-slate-800 border-l-2 border-transparent"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] flex-shrink-0 transition-colors duration-150 ${
          active ? "text-[#2563EB]" : "text-[#94a3b8] group-hover:text-slate-600"
        }`}
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ─── GroupLabel ───────────────────────────────────────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest px-3 mb-1.5 select-none">
      {label}
    </p>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function GroupDivider() {
  return <div className="my-3 mx-3 border-t border-[#E2E8F0]" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await removeToken();
    window.location.href = "/dashboard-admin/auth/login";
  }

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden lg:flex h-screen w-[230px] fixed left-0 top-0 bg-white border-r border-[#E2E8F0] flex-col z-50 shadow-[1px_0_0_0_#f1f5f9]">
        {/* Brand ─────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E2E8F0] flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Ecco Market"
              className="h-8 w-auto flex-shrink-0"
            />
          </Link>
          <p className="text-[11px] font-semibold text-[#94a3b8] mt-1.5 tracking-widest uppercase select-none">
            Admin Dashboard
          </p>
        </div>

        {/* Nav groups ─────────────────────────────────────────────────────── */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {menuGroups.map((group, groupIdx) => (
            <div key={group.label}>
              <GroupLabel label={group.label} />

              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    pathname={pathname}
                  />
                ))}
              </div>

              {groupIdx < menuGroups.length - 1 && <GroupDivider />}
            </div>
          ))}
        </nav>

        {/* Bottom – logout ─────────────────────────────────────────────────── */}
        <div className="px-2.5 py-3 border-t border-[#E2E8F0] flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-all duration-150 border-l-2 border-transparent group"
          >
            <span
              className="material-symbols-outlined text-[20px] flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] flex justify-around items-center px-1 py-1 safe-bottom">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                active
                  ? "text-[#2563EB] bg-[#EFF6FF]"
                  : "text-[#94a3b8] hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: active
                    ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 22"
                    : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 22",
                }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}

        {/* More */}
        <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[#94a3b8] hover:text-slate-600 hover:bg-slate-50 transition-all duration-150">
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 22" }}
          >
            more_horiz
          </span>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>
    </>
  );
}
