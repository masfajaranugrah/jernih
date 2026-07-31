"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

// ⏳ Grace period sebelum redirect ke login.
// Token mungkin belum terbaca saat pertama kali render (mis. sedang di-refresh).
// Selama window ini, halaman (dan skeleton-nya) tetap tampil.
const REDIRECT_DELAY_MS = 5000;

/**
 * DashboardSkeleton — Full-page skeleton untuk unauthenticated users.
 * Muncul saat user belum login, sebelum redirect ke halaman login.
 */
function DashboardSkeleton() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen antialiased flex">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[#e1e3e4] bg-white p-5 gap-6 animate-pulse">
        <div className="h-8 w-32 rounded-lg bg-[#e1e3e4]" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-[#e1e3e4]" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 flex flex-col min-h-0 p-6 md:p-10">
        <div className="mb-8 md:mb-10 animate-pulse">
          <div className="h-3 sm:h-4 w-28 sm:w-32 rounded-full bg-[#e1e3e4] mb-1.5 sm:mb-2" />
          <div className="h-7 sm:h-8 w-48 sm:w-56 rounded-lg bg-[#e1e3e4] mb-2 sm:mb-3" />
          <div className="h-4 sm:h-5 w-40 sm:w-48 rounded-full bg-[#e1e3e4]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden">
              <div className="aspect-square bg-[#e1e3e4]" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-20 rounded-full bg-[#e1e3e4]" />
                <div className="h-5 w-3/4 rounded-lg bg-[#e1e3e4]" />
                <div className="h-7 w-1/2 rounded-lg bg-[#e1e3e4]" />
                <div className="h-11 w-full rounded-lg bg-[#e1e3e4] mt-4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * AuthCheck — client-side auth guard **tanpa API call**.
 *
 * ⚡ Cuma baca cookie `mh_token` secara synchronous:
 *    - Tidak ada token → skeleton + redirect ke login
 *    - Ada token      → render children langsung
 *
 * 🚀 Tidak ada dependency ke /api/auth/me.
 *    Verifikasi token dilakukan oleh masing-masing API endpoint
 *    (wishlist, orders, dll) — kalau 401, redirect ke login.
 *
 * 🧠 Kenapa?
 *    - Menghilangkan 1 API call per halaman → backend tidak loyo
 *    - Cookie non-httpOnly → bisa dibaca client-side
 *    - Instant render — skeleton cuma untuk unauthenticated users
 */
export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // ⚡ Baca cookie SEBELUM render — tanpa API call
  const [guardState, setGuardState] = useState<"authenticated" | "unauthenticated">(() => {
    if (typeof document !== "undefined" && !getToken()) return "unauthenticated";
    return "authenticated";
  });

  // ⏳ Grace period 5 detik: kalau token belum terbaca saat render pertama,
  // jangan langsung redirect ke login. Setelah 5 detik, cek ulang:
  //    - token sudah ada → lanjut render halaman
  //    - token tetap tidak ada → baru redirect ke login
  useEffect(() => {
    if (guardState !== "unauthenticated") return;
    const timer = setTimeout(() => {
      if (getToken()) {
        setGuardState("authenticated");
      } else {
        router.push("/dashboard/pelanggan/login");
      }
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [guardState, router]);

  if (guardState === "unauthenticated") {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
}
