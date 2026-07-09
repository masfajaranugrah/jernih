import Link from "next/link";
import { fetchServices } from "@/lib/service-actions";
import JasaSectionClient from "./JasaSectionClient";

function ArrowIcon() {
  return (
    <svg className="inline-block h-[1em] w-[1em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="w-full rounded-2xl border border-dashed border-[#bfc9c3] bg-white px-6 py-10 text-center">
      <p className="text-sm font-semibold text-[#404944]">Jasa tidak tersedia saat ini</p>
      <Link
        href="/jasa"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#bfc9c3] px-4 py-1.5 text-xs font-semibold text-[#404944] transition-colors hover:border-[#064e3b] hover:text-[#064e3b]"
      >
        Lihat Halaman Jasa
      </Link>
    </div>
  );
}

export default async function JasaSection() {
  let services;
  try {
    services = await fetchServices();
  } catch {
    return null;
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#191c1d]">Jasa Profesional</h2>
        <Link href="/jasa" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
          Lihat Semua <ArrowIcon />
        </Link>
      </div>
      {services.length === 0 ? (
        <div className="mt-5"><EmptyState /></div>
      ) : (
        <JasaSectionClient services={services.slice(0, 4)} />
      )}
    </section>
  );
}
