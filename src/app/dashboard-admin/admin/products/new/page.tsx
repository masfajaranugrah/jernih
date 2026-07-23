import AddProductForm from "../AddProductForm";

export const metadata = { title: "Tambah Produk - Admin Jernih Creatife" };

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>


      <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#003527]">inventory_2</span>
            <h1 className="text-[#003527] font-bold text-lg">Admin — Produk</h1>
          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-10 py-8">
          <AddProductForm />
        </main>
      </div>
    </div>
  );
}
