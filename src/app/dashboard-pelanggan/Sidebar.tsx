"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard-pelanggan", icon: "dashboard", label: "Overview" },
  { href: "/dashboard-pelanggan/orders", icon: "shopping_bag", label: "Orders" },
  { href: "/dashboard-pelanggan/wishlist", icon: "favorite", label: "Wishlist" },
  { href: "/dashboard-pelanggan/vouchers", icon: "confirmation_number", label: "Vouchers" },
  { href: "/dashboard-pelanggan/chat", icon: "chat", label: "Chat" },
  { href: "/dashboard-pelanggan/addresses", icon: "location_on", label: "Addresses" },
];

const bottomItems = [
  { href: "/dashboard-pelanggan/profile", icon: "person", label: "Profile" },
];

export default function SidebarPelanggan() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard-pelanggan"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-white border-r border-[#e1e3e4] flex-col py-6 px-3 overflow-y-auto z-50 shadow-sm">
        {/* Brand + avatar */}
        <div className="mb-8 px-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e7e8e9] overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl2-YncPXbaGQkoCESsmhtcSYO6idgm8Eq-TqCePrSZ7UfCmEU2hxTlqJkmcp_nMJPNdLsPwgLKFszUnKzXLWUmz6v-K8eMWjhaC8_vteIoR6RbSiFw3AmElGP2xneI5rqtiYTn-A5Q67dejBPyVYl53vR4IEFUAPKA4jz2PHcud1Pg5UoDXNeF6ZpWPbZx4Fpw1Gzrz6gyXoSdrL1bBAI41sLDdL8sTos3xeACWecV8AyxY4tHbkk"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[#003527] font-bold text-lg leading-tight truncate">Jernih Creatife</h2>
            <p className="text-xs text-[#404944]">Premium Member</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#f3f4f5] text-[#003527] font-bold border-r-2 border-[#003527] scale-[0.98]"
                    : "text-[#404944] hover:text-[#003527] hover:bg-[#f3f4f5]"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-4 border-t border-[#e1e3e4] flex flex-col gap-0.5">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#f3f4f5] text-[#003527] font-bold border-r-2 border-[#003527]"
                    : "text-[#404944] hover:text-[#003527] hover:bg-[#f3f4f5]"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e1e3e4] flex justify-around items-center px-2 py-2">
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active ? "text-[#003527]" : "text-[#707974]"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/dashboard-pelanggan/profile"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#707974]"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </nav>
    </>
  );
}
