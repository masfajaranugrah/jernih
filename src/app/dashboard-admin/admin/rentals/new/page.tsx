import AddRentalForm from "../AddRentalForm";

export const metadata = { title: "Tambah Item Sewa - Admin Jernih Creatife" };

export default function AddRentalPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6">
          <AddRentalForm />
        </main>
      </div>
    </div>
  );
}
