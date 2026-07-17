import Link from "next/link";

export default function SewaNotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-center px-4">
      <span className="material-symbols-outlined text-6xl text-[#c3c6d5] mb-4">inventory_2</span>
      <h1 className="text-2xl font-bold text-[#0b1c30] mb-2">Item Sewa Tidak Ditemukan</h1>
      <p className="text-sm text-[#737784] mb-6">Item yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
      <Link
        href="/sewa"
        className="inline-flex items-center gap-2 bg-[#003c90] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#0f52ba] transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Kembali ke Katalog Sewa
      </Link>
    </div>
  );
}
