import { cookies } from "next/headers";
import Navbar from "@/app/(storefront)/Navbar";
import StorefrontProviders from "./StorefrontProviders";
import MaintenancePage from "@/app/maintenance/page";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** Decode JWT payload untuk baca role & name */
function decodeJwtPayload(token: string): { role?: string; name?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Slug pelanggan dari cookie — dibaca di server supaya href navbar
 *  konsisten antara render server & client (hindari hydration error). */
function slugFromToken(token: string | undefined): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload?.name) return null;
  return payload.name.toLowerCase().replace(/\s+/g, "-");
}

async function getMaintenanceStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/settings/maintenance_mode`, {
      // Revalidate tiap 30 detik — tanpa cache=no-store agar ringan
      next: { revalidate: 30 },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.enabled === true;
  } catch {
    return false;
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenanceOn, cookieStore] = await Promise.all([
    getMaintenanceStatus(),
    cookies(),
  ]);

  // Cek apakah user adalah ADMIN (bisa akses saat maintenance)
  const token = cookieStore.get("mh_token")?.value;
  const isAdmin = token ? decodeJwtPayload(token)?.role === "ADMIN" : false;
  // Slug pelanggan dari cookie — dikirim ke Navbar agar href wishlist/profile
  // konsisten server↔client (hindari hydration error & flash login).
  const initialSlug = slugFromToken(token);

  // Maintenance mode aktif & bukan admin → tampilkan halaman maintenance
  if (maintenanceOn && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <StorefrontProviders>
      <Navbar initialSlug={initialSlug} />
      <div className="min-h-screen bg-[#e3e5e0] text-black">
        {children}
      </div>
    </StorefrontProviders>
  );
}
