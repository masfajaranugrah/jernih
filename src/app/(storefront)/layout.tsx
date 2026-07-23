import { cookies } from "next/headers";
import Navbar from "@/app/(storefront)/Navbar";
import StorefrontProviders from "./StorefrontProviders";
import MaintenancePage from "@/app/maintenance/page";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** Decode JWT payload untuk baca role */
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
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

  // Maintenance mode aktif & bukan admin → tampilkan halaman maintenance
  if (maintenanceOn && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <StorefrontProviders>
      <Navbar />
      {children}
    </StorefrontProviders>
  );
}
