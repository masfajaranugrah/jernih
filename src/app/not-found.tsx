import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] px-4">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003527] via-[#064e3b] to-[#95d3ba]" />

      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f1f5f9]">
          <svg
            className="h-10 w-10 text-[#475569]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status code */}
        <h1 className="text-[120px] font-black leading-none tracking-tight text-[#003527]">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-2 text-2xl font-bold text-[#191c1d]">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="mt-3 text-base leading-relaxed text-[#475569]">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          Periksa kembali URL atau kembali ke beranda.
        </p>

        {/* Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#064e3b] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#043b2d] hover:-translate-y-0.5"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-[#94a3b8]">
        © 2025 Jernih Creatife
      </p>
    </main>
  );
}
