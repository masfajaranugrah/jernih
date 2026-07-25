import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notifikasi - Jernih Creatife",
};

export default function NotifikasiPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-[60px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e2e8f0] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-bold text-[#0f172a]">Notifikasi</h1>
        </div>
      </div>

      {/* Empty state */}
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="h-16 w-16 text-[#94a3b8] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <h2 className="text-lg font-semibold text-[#475569] mb-1">Belum ada notifikasi</h2>
          <p className="text-sm text-[#94a3b8]">Notifikasi akan muncul di sini</p>
        </div>
      </div>
    </main>
  );
}
