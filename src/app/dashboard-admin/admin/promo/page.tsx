import Link from "next/link";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import PromoEditor from "./PromoEditor";
import { getPromoCardsFromBackend } from "@/lib/promo-actions";

export const metadata = { title: "Editor Promo - Admin Jernih Creatife" };

export default async function AdminPromoPage() {
  // Fetch dari backend, bukan in-memory store
  const promos = await getPromoCardsFromBackend();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Link href="/dashboard-admin/admin" className="text-[#707974] hover:text-[#003527] transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-[#003527]">local_offer</span>
            <h1 className="text-[#003527] font-bold text-lg">Editor Promo Spesial</h1>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-[#707974] hover:text-[#003527] transition-colors"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Preview Halaman Utama
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl px-6 py-10">
          <PromoEditor initial={promos} />
        </main>
      </div>
    </div>
  );
}
