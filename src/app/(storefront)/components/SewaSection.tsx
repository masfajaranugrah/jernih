import Image from "next/image";
import Link from "next/link";
import { fetchRentalItems, type ApiRentalItem } from "@/lib/rental-actions";
import { formatRupiah } from "@/lib/api";

function ArrowIcon() {
  return (
    <svg className="inline-block h-[1em] w-[1em] fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />
    </svg>
  );
}

function RentalCard({ item }: { item: ApiRentalItem }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        {item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 fill-[#bfc9c3]" viewBox="0 0 24 24">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 rounded bg-[#064e3b] px-2 py-0.5 text-[10px] font-black uppercase text-white">
          Sewa
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-[#191c1d] sm:text-base">
          {item.name}
        </h3>
        <p className="mt-4 border-t border-[#bfc9c3]/30 pt-3 text-base font-bold text-[#064e3b] sm:text-lg">
          {formatRupiah(item.pricePerDay)}
          <span className="text-xs font-normal text-[#707974]">/hari</span>
        </p>
      </div>
    </div>
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
  const rentalItems = await fetchRentalItems();

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
        <div className="mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {rentalItems.slice(0, 4).map((item) => (
            <div key={item.id} className="w-[160px] flex-shrink-0 snap-start md:w-auto">
              <RentalCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
