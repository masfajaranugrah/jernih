export const dynamic = "force-dynamic";
import Link from "next/link";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import RentalsAdminClient from "./RentalsAdminClient";
import { fetchRentalItems } from "@/lib/rental-actions";

export const metadata = { title: "Daftar Sewa - Admin Jernih Creatife" };

export default async function AdminRentalsPage() {
  const items = await fetchRentalItems({ all: true });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#003527]">handyman</span>
            <h1 className="text-[#003527] font-bold text-lg">Manajemen Sewa</h1>
          </div>
          <Link href="/dashboard-admin/admin/rentals/new"
            className="flex items-center gap-2 rounded-lg bg-[#064e3b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#043b2d]">
            <span className="material-symbols-outlined text-base">add</span>
            Tambah Item Sewa
          </Link>
        </header>

        <main className="p-6">
          <RentalsAdminClient items={items} />
        </main>
      </div>
    </div>
  );
}
