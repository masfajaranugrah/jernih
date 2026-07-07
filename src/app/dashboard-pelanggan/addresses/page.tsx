import SidebarPelanggan from "../Sidebar";
import AddressesContent from "./AddressesContent";

export const metadata = {
  title: "Buku Alamat - Dashboard Pelanggan",
  description: "Kelola alamat pengiriman Anda.",
};

export default function AddressesPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen antialiased flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>

      <SidebarPelanggan />

      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-[1280px] mx-auto overflow-x-hidden pb-24 md:pb-10">
        <AddressesContent />
      </main>
    </div>
  );
}
