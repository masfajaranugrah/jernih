"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import TopNavBar from "./TopNavBar";

/** Halaman yang TIDAK menampilkan sidebar (mis. halaman login). */
const NO_SIDEBAR_PREFIXES = [
  "/dashboard-admin/admin/login",
  "/dashboard-admin/auth/login",
];

/**
 * Shell layout admin: merender DashboardSidebar + TopNavBar sekali di level layout
 * supaya navbar selalu muncul di semua halaman dan tidak re-mount saat pindah halaman.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = NO_SIDEBAR_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Debug: cek token di cookie saat dashboard admin termuat
  // if (typeof window !== "undefined" && !hideSidebar) {
  //   const match = document.cookie.match(/(?:^|;\s*)mh_token=([^;]+)/);
  //   const token = match ? decodeURIComponent(match[1]).slice(0, 50) + "..." : "❌ TIDAK ADA";
  //   console.log("🔑 [AdminShell] mh_token cookie:", token);
  //   console.log("🍪 Semua cookie:", document.cookie || "(kosong)");
  // }

  if (hideSidebar) return <>{children}</>;

  return (
    <>
      <DashboardSidebar />
      <div className="flex flex-col min-h-screen">
        <TopNavBar />
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}
