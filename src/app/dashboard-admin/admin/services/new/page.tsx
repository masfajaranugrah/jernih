import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import AddServiceForm from "../AddServiceForm";

export const metadata = { title: "Tambah Jasa - Admin Jernih Creatife" };

export default function NewServicePage() {
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
            <span className="material-symbols-outlined text-[#003527]">design_services</span>
            <h1 className="text-[#003527] font-bold text-lg">Admin — Jasa</h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1100px] px-6 py-10">
          <AddServiceForm />
        </main>
      </div>
    </div>
  );
}
