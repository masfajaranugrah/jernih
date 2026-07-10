import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import CategoriesAdminClient from "./CategoriesAdminClient";
import { getCategories } from "@/lib/category-actions";

export const metadata = { title: "Manajemen Kategori - Admin Jernih Creatife" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

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
            <span className="material-symbols-outlined text-[#003527]">category</span>
            <h1 className="text-[#003527] font-bold text-lg">Manajemen Kategori</h1>
          </div>
        </header>

        <main className="p-6">
          <CategoriesAdminClient initialCategories={categories} />
        </main>
      </div>
    </div>
  );
}
