// Komponen skeleton menggunakan Tailwind CSS animate-pulse
// Tidak butuh library eksternal

/** Skeleton satu kartu produk/jasa/sewa */
function CardSkeleton() {
  return (
    <div className="w-[160px] flex-shrink-0 snap-start md:w-auto animate-pulse">
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">
        <div className="aspect-square bg-[#e1e3e4]" />
        <div className="flex flex-col gap-2 p-3 sm:p-4">
          <div className="h-2.5 w-16 rounded bg-[#e1e3e4]" />
          <div className="h-3.5 w-full rounded bg-[#e1e3e4]" />
          <div className="h-3.5 w-3/4 rounded bg-[#e1e3e4]" />
          <div className="mt-2 h-4 w-24 rounded bg-[#e1e3e4]" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton section produk/jasa/sewa (grid 4 kartu) */
export function ProductSkeleton() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-[#e1e3e4]" />
        <div className="h-4 w-20 animate-pulse rounded bg-[#e1e3e4]" />
      </div>
      <div className="mt-5 -mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:px-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

/** Skeleton kartu promo (horizontal scroll) */
export function PromoSkeleton() {
  return (
    <section>
      <div className="mx-auto mb-6 h-8 w-64 animate-pulse rounded-lg bg-[#e1e3e4]" />
      <div className="-mx-4 flex gap-4 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:px-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] w-[70vw] max-w-[280px] flex-shrink-0 animate-pulse rounded-3xl bg-[#e1e3e4] md:w-auto md:max-w-none"
          />
        ))}
      </div>
    </section>
  );
}

/** Skeleton hero bento grid */
export function HeroSkeleton() {
  return (
    <section className="w-full px-4 py-6 md:px-8">
      <div className="grid grid-cols-12 gap-4 md:gap-5">
        {/* Main tile */}
        <div className="col-span-12 min-h-[380px] animate-pulse rounded-3xl bg-[#e1e3e4] lg:col-span-8" />
        {/* Banner kanan atas */}
        <div className="col-span-12 min-h-[240px] animate-pulse rounded-3xl bg-[#e1e3e4] lg:col-span-4" />
        {/* Banner kiri bawah */}
        <div className="col-span-6 min-h-[220px] animate-pulse rounded-3xl bg-[#e1e3e4] lg:col-span-2" />
        {/* Banner kanan bawah */}
        <div className="col-span-6 min-h-[220px] animate-pulse rounded-3xl bg-[#e1e3e4] lg:col-span-2" />
      </div>
    </section>
  );
}
