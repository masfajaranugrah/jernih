/**
 * loading.tsx — skeleton halaman daftar produk
 * Meniru layout: filter sidebar (desktop) + grid produk
 */

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">
      <div className="aspect-square bg-[#e1e3e4]" />
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="h-2.5 w-16 rounded bg-[#e1e3e4]" />
        <div className="h-3.5 w-full rounded bg-[#e1e3e4]" />
        <div className="h-3.5 w-3/4 rounded bg-[#e1e3e4]" />
        <div className="mt-2 h-4 w-24 rounded bg-[#e1e3e4]" />
      </div>
    </div>
  );
}

export default function ProdukLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header / breadcrumb */}
      <div className="px-4 py-6 md:px-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#e1e3e4]" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-[#e1e3e4]" />
      </div>

      <div className="flex gap-6 px-4 pb-12 md:px-8">
        {/* Sidebar filter — desktop only */}
        <aside className="hidden w-56 flex-shrink-0 md:block">
          <div className="animate-pulse rounded-2xl border border-[#e1e3e4] bg-white p-5">
            <div className="h-5 w-24 rounded bg-[#e1e3e4]" />
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-[#e1e3e4]" style={{ width: `${60 + i * 8}%` }} />
              ))}
            </div>
            <div className="mt-6 h-5 w-20 rounded bg-[#e1e3e4]" />
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-[#e1e3e4]" />
              ))}
            </div>
          </div>
        </aside>

        {/* Grid produk */}
        <main className="flex-1">
          {/* Sort bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-[#e1e3e4]" />
            <div className="h-9 w-36 animate-pulse rounded-xl bg-[#e1e3e4]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
