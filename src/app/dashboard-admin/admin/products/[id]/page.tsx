import { notFound } from "next/navigation";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import EditProductForm from "../EditProductForm";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

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
            <span className="material-symbols-outlined text-[#003527]">edit</span>
            <h1 className="text-[#003527] font-bold text-lg">Edit Produk</h1>
          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-10 py-8">
          <EditProductForm product={product} />
        </main>
      </div>
    </div>
  );
}
