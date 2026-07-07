import SidebarPelanggan from "../Sidebar";
import VouchersContent from "./VouchersContent";

export const metadata = {
  title: "Vouchers - Dashboard Pelanggan",
  description: "Kelola dan gunakan voucher diskon Anda.",
};

export default function VouchersPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen antialiased flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>
      <SidebarPelanggan />
      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-[1280px] mx-auto overflow-x-hidden pb-24 md:pb-10">
        <div className="mb-8">
          <h1 className="text-[#191c1d] font-semibold tracking-tight mb-1"
            style={{ fontSize: "36px", lineHeight: "1.2", letterSpacing: "-0.02em" }}>
            Vouchers
          </h1>
          <p className="text-[#707974] text-base">Gunakan voucher untuk hemat lebih banyak.</p>
        </div>
        <VouchersContent />
      </main>
    </div>
  );
}
