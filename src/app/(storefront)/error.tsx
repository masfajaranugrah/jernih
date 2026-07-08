"use client";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6]">
        <svg className="h-8 w-8 fill-[#ba1a1a]" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#191c1d]">Gagal memuat halaman</h2>
      <p className="max-w-sm text-sm text-[#707974]">
        Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-[#064e3b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#043b2d] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
