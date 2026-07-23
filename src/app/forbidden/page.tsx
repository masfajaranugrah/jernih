import Link from "next/link";

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const from = params?.from ?? null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] px-4">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003527] via-[#064e3b] to-[#95d3ba]" />

      <div className="mx-auto max-w-md text-center">
        {/* Icon — shield with lock */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fef0f0]">
          <svg
            className="h-10 w-10 text-[#dc2626]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Status code */}
        <h1 className="text-[120px] font-black leading-none tracking-tight text-[#003527]">
          403
        </h1>

        {/* Title */}
        <h2 className="mt-2 text-2xl font-bold text-[#191c1d]">
          Akses Ditolak
        </h2>

        {/* Description */}
        <p className="mt-3 text-base leading-relaxed text-[#475569]">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          {process.env.NODE_ENV === "development" && from && (
            <span className="mt-1 block text-sm text-[#94a3b8]">
              Mencoba mengakses: <code className="rounded bg-[#f1f5f9] px-1 font-mono text-xs">{decodeURIComponent(from)}</code>
            </span>
          )}
        </p>

        {/* Action button — hanya kembali ke beranda */}
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
