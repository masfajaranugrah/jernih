/**
 * loading.tsx — skeleton halaman daftar sewa
 * Layout mirip /jasa: filter + grid kartu sewa
 */

function SewaCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">
      <div className="aspect-video bg-[#e1e3e4]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-2.5 w-16 rounded bg-[#e1e3e4]" />
        <div className="h-4 w-full rounded bg-[#e1e3e4]" />
        <div className="h-4 w-2/3 rounded bg-[#e1e3e4]" />
        <div className="mt-1 flex items-center justify-between">
          <div className="h-5 w-28 rounded bg-[#e1e3e4]" />
          <div className="h-8 w-20 rounded-xl bg-[#e1e3e4]" />
        </div>
      </div>
    </div>
  );
}

export default function SewaLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="px-4 py-6 md:px-8">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-[#e1e3e4]" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-[#e1e3e4]" />
      </div>

      <div className="flex gap-6 px-4 pb-12 md:px-8">
        {/* Sidebar filter */}
        <aside className="hidden w-56 flex-shrink-0 md:block">
          <div className="animate-pulse rounded-2xl border border-[#e1e3e4] bg-white p-5">
            <div className="h-5 w-24 rounded bg-[#e1e3e4]" />
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-[#e1e3e4]" style={{ width: `${50 + i * 12}%` }} />
              ))}
            </div>
            <div className="mt-6 h-5 w-20 rounded bg-[#e1e3e4]" />
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-9 w-full rounded-lg bg-[#e1e3e4]" />
              <div className="h-9 w-full rounded-lg bg-[#e1e3e4]" />
            </div>
          </div>
        </aside>

        {/* Grid sewa */}
        <main className="flex-1">
          <div className="mb-5 flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-[#e1e3e4]" />
            <div className="h-9 w-36 animate-pulse rounded-xl bg-[#e1e3e4]" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <SewaCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
