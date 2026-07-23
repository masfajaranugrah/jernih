export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] px-4">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003527] via-[#064e3b] to-[#95d3ba]" />

      <div className="mx-auto max-w-md text-center">
        {/* Icon — tools */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fef3e7]">
          <svg
            className="h-10 w-10 text-[#ea580c]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.42 15.17l-5.3 5.3a2.12 2.12 0 01-3-3l5.3-5.3m-2.53 2.53l5.66-5.66M14.83 11.42l5.3-5.3a2.12 2.12 0 00-3-3l-5.3 5.3m2.53-2.53l-5.66 5.66"
            />
          </svg>
        </div>

        {/* Status */}
        <h1 className="text-[80px] font-black leading-none tracking-tight text-[#003527]">
          Maintenance
        </h1>

        {/* Title */}
        <h2 className="mt-2 text-2xl font-bold text-[#191c1d]">
          Kami Sedang Memperbaiki Sistem
        </h2>

        {/* Description */}
        <p className="mt-3 text-base leading-relaxed text-[#475569]">
          Situs sedang dalam masa pemeliharaan untuk memberikan pelayanan yang lebih baik.
          Silakan kembali lagi nanti.
        </p>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-[#94a3b8]">
        © 2025 Jernih Creatife
      </p>
    </main>
  );
}
