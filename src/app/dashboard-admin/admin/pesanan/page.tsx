import { cookies } from "next/headers";
import OrdersContent from "../../orders/OrdersContent";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export const metadata = {
  title: "Pesanan - Jernih Creatife Admin",
  description: "Kelola pesanan pelanggan.",
};

async function getUserName(): Promise<string> {
  const token = (await cookies()).get("mh_token")?.value;
  if (!token) return "Admin";

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return "Admin";
    const data = await res.json();
    return data?.name ?? "Admin";
  } catch {
    return "Admin";
  }
}

export default async function AdminPesananPage() {
  const userName = await getUserName();

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <main className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* TopBar */}
        <header className="w-full h-16 sticky top-0 bg-[#f8f9fa]/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#064e3b] flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold hidden sm:block">{userName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-6 max-w-[1440px] mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold tracking-tight text-[#191c1d]">
              Pesanan
            </h1>
            <p className="text-[#707974] text-sm mt-1">
              Kelola dan pantau semua pesanan pelanggan.
            </p>
          </div>

          <OrdersContent />
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#bfc9c3] p-6 bg-[#f3f4f5]">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#404944]">© 2025 Jernih Creatife. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
