"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

const navItems = [
  { href: "/dashboard-admin/orders", icon: "package", label: "Orders" },
  { href: "/dashboard-admin/chat", icon: "chat", label: "Chat" },
  { href: "/dashboard-admin/tickets", icon: "support_agent", label: "Bantuan Tiket" },
  { href: "/dashboard-admin/admin/homepage", icon: "tune", label: "Homepage" },
  { href: "/dashboard-admin/admin/hero", icon: "image", label: "Hero Banner" },
  { href: "/dashboard-admin/admin/products", icon: "inventory_2", label: "Produk" },
  { href: "/dashboard-admin/admin/categories", icon: "category", label: "Kategori" },
  { href: "/dashboard-admin/admin/services", icon: "design_services", label: "Jasa" },
  { href: "/dashboard-admin/admin/rentals", icon: "handyman", label: "Sewa" },
  { href: "/dashboard-admin/admin/promo", icon: "local_offer", label: "Promo" },
  { href: "/dashboard-admin/admin/pesanan", icon: "shopping_bag", label: "Pesanan" },
  { href: "/dashboard-admin/admin/toko", icon: "storefront", label: "Info Toko" },
  { href: "/dashboard-admin/cart", icon: "shopping_cart", label: "Cart" },
  { href: "/dashboard-admin/wishlist", icon: "favorite", label: "Wishlist" },
  { href: "/dashboard-admin/vouchers", icon: "confirmation_number", label: "Vouchers" },
  { href: "/dashboard-admin/payments", icon: "receipt_long", label: "Payments" },
  { href: "/dashboard-admin/reviews", icon: "rate_review", label: "Reviews" },
  { href: "/dashboard-admin/complaints", icon: "report_problem", label: "Complaints" },
  { href: "/dashboard-admin/addresses", icon: "location_on", label: "Addresses" },
  // { href: "/dashboard-admin/profile", icon: "person", label: "Profile" },
  { href: "/dashboard-admin/settings", icon: "settings", label: "Settings" },

];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPath = pathname.startsWith("/dashboard-admin/admin");

  function handleLogout() {
    removeToken();
    // Hard redirect agar middleware baca cookie yang sudah dihapus
    const loginPath = isAdminPath ? "/dashboard-admin/admin/login" : "/dashboard-admin/auth/login";
    window.location.href = loginPath;
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-white border-r border-[#e1e3e4] flex-col py-6 px-3 overflow-y-auto z-50">
        {/* Brand */}
        <div className="mb-8 px-2">
          <Link href="/">
            <h1 className="text-[#003527] font-semibold tracking-tight" style={{ fontSize: "24px", lineHeight: "1.3" }}>
              Jernih Creatife
            </h1>
          </Link>
          <p className="text-[#404944] text-xs mt-1 font-medium tracking-wide">Admin Dashboard</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`flex items-center gap-2 px-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#064e3b] text-[#80bea6]"
                    : "text-[#404944] hover:bg-[#e7e8e9]"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Affiliate */}
          <div className="pt-4 mt-4 border-t border-[#e1e3e4]">
            <a
              href="#"
              className="flex items-center justify-between gap-2 px-2 py-3 text-[#003527] font-bold text-sm hover:bg-[#e7e8e9] rounded-lg transition-all"
            >
              <span className="uppercase tracking-wider text-xs">Affiliate Program</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

         
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-4 border-t border-[#e1e3e4] space-y-0.5">
          <a href="#" className="flex items-center gap-2 px-2 py-3 text-[#404944] hover:bg-[#e7e8e9] rounded-lg text-sm font-semibold transition-all">
            <span className="material-symbols-outlined text-xl">help</span>
            <span>Help</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-3 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg text-sm font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e1e3e4] flex justify-around items-center px-2 py-2 safe-bottom">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-[#003527]" : "text-[#707974]"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        {/* More button */}
        <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#707974]">
          <span className="material-symbols-outlined text-[22px]">more_horiz</span>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>
    </>
  );
}
