import Link from "next/link";
import { fetchRentalItems } from "@/lib/rental-actions";
import SewaSectionClient from "./SewaSectionClient";

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
      <p className="text-sm font-semibold text-[#404944]">Item sewa tidak tersedia saat ini</p>
      <Link
        href="/sewa"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#bfc9c3] px-4 py-1.5 text-xs font-semibold text-[#404944] transition-colors hover:border-[#064e3b] hover:text-[#064e3b]"
      >
        Lihat Halaman Sewa
      </Link>
    </div>
  );
}

export default async function SewaSection() {
  let rentalItems;
  try {
    rentalItems = await fetchRentalItems();
  } catch {
    return null;
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#191c1d]">Sewa Peralatan</h2>
        <Link href="/sewa" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
          Lihat Semua <ArrowIcon />
        </Link>
      </div>
      {rentalItems.length === 0 ? (
        <div className="mt-5"><EmptyState /></div>
      ) : (
        <SewaSectionClient rentalItems={rentalItems.slice(0, 4)} />
      )}
    </section>
  );
}
