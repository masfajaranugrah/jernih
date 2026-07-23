export const dynamic = "force-dynamic";
import Link from "next/link";
import ServicesAdminClient from "./ServicesAdminClient";
import { fetchServices } from "@/lib/service-actions";

export const metadata = { title: "Daftar Jasa - Admin Jernih Creatife" };

export default async function AdminServicesPage() {
 const services = await fetchServices();

 return (
  <div className="min-h-screen bg-[#f8f9fa]">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
   `}</style>


   <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
     <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-[#003527]">design_services</span>
      <h1 className="text-[#003527] font-bold text-lg">Manajemen Jasa</h1>
     </div>
     <Link href="/dashboard-admin/admin/services/new"
      className="flex items-center gap-2 rounded-lg bg-[#064e3b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#043b2d]">
      <span className="material-symbols-outlined text-base">add</span>
      Tambah Jasa
     </Link>
    </header>

    <main className="p-6">
     <ServicesAdminClient services={services} />
    </main>
   </div>
  </div>
 );
}
