import { cookies } from "next/headers";
import OrdersContent from "./OrdersContent";

export const metadata = {
  title: "Pesanan - Admin Dashboard",
  description: "Kelola dan pantau semua pesanan pelanggan.",
};

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

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

export default async function OrdersPage() {
  // getUserName available if needed for personalization
  // const userName = await getUserName();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="lg:ml-[230px] min-h-screen flex flex-col pb-8">
        {/* Page Header */}
        <div className="px-6 pt-8 pb-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[#0F172A] font-bold text-2xl md:text-3xl">
                Pesanan
              </h1>
              <p className="text-[#64748B] text-sm mt-1">
                Kelola dan pantau semua pesanan pelanggan.
              </p>
            </div>

            {/* Export button — UI only */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-medium hover:bg-[#F1F5F9] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-[#64748B]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Main Content */}
        <section className="px-6 py-6 max-w-5xl mx-auto w-full">
          <OrdersContent />
        </section>
      </main>
    </div>
  );
}
