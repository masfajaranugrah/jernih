"use client";

/** TopNavBar khusus admin dashboard — sticky di atas semua halaman */
export default function TopNavBar() {
  return (
    <header className="bg-white w-full h-16 sticky top-0 shadow-sm z-40 flex items-center flex-shrink-0 border-b border-[#e1e3e4]">
      <div className="flex justify-between items-center px-6 w-full lg:pl-[280px]">
        {/* Left: Page indicator + breadcrumb */}
        <div className="flex items-center gap-4">
          <span className="text-[#191c1d] font-bold text-lg tracking-tight">Admin Panel</span>
          <span className="hidden sm:block text-[#c4c7c8] text-sm">/</span>
          <span className="hidden sm:block text-[#707974] text-sm font-medium">Jernih Creatife</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button className="relative p-2 text-[#404944] hover:text-[#003527] hover:bg-[#f3f4f5] rounded-lg transition-all" title="Notifikasi">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full" />
          </button>
          <button className="p-2 text-[#404944] hover:text-[#003527] hover:bg-[#f3f4f5] rounded-lg transition-all" title="Bantuan">
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
          <div className="mx-2 w-px h-6 bg-[#e1e3e4]" />
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-[#404944] hover:text-[#003527] hover:bg-[#f3f4f5] rounded-lg transition-all" title="Profil">
            <span className="material-symbols-outlined text-xl">account_circle</span>
            <span className="hidden sm:block">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
