import Link from "next/link";
import JasaSectionClient from "./JasaSectionClient";

function ArrowIcon() {
  return (
    <svg className="inline-block h-[1em] w-[1em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />
    </svg>
  );
}

export default function JasaSection() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#191c1d]">Jasa Profesional</h2>
        <Link href="/jasa" className="flex items-center gap-1 text-sm font-bold text-[#1e3a8a] hover:underline">
          Lihat Semua <ArrowIcon />
        </Link>
      </div>
      {/* Data fetching real-time via TanStack Query (no Next.js cache) */}
      <JasaSectionClient />
    </section>
  );
}
