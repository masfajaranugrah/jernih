import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SidebarPelanggan from "../Sidebar";
import AuthCheck from "./AuthCheck";
import { AuthProvider } from "@/lib/auth-context";

export default async function DashboardPelangganLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ nama: string }>;
}) {
  const { nama } = await params;

  // 🔐 Guard server-side — redirect SEBELUM HTML dikirim.
  // Mencegah flash halaman login: browser tidak pernah merender halaman ini
  // saat tidak ada token. Cookie mh_token non-httpOnly → bisa dibaca di sini.
  const token = (await cookies()).get("mh_token")?.value;
  if (!token) {
    redirect("/dashboard/pelanggan/login");
  }

  return (
    <AuthProvider>
      <AuthCheck>
        <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen antialiased flex">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
            .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
            .icon-fill { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
          `}</style>
          <SidebarPelanggan nama={nama} />
          <main className="flex-1 md:ml-64 flex flex-col min-h-0 max-w-[1280px] max-h-screen">
            <div className="p-6 md:p-10 pb-24 md:pb-10 flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </AuthCheck>
    </AuthProvider>
  );
}
