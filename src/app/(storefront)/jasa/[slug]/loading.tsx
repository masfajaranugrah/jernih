/**
 * loading.tsx — skeleton halaman detail jasa
 * Layout: gambar hero + info jasa + detail paket
 */
export default function JasaDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-4 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-4 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-44 animate-pulse rounded bg-[#e1e3e4]" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Gambar + galeri */}
          <div className="flex flex-col gap-3 lg:w-1/2">
            <div className="aspect-video w-full animate-pulse rounded-3xl bg-[#e1e3e4]" />
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video w-24 animate-pulse rounded-xl bg-[#e1e3e4]" />
              ))}
            </div>
          </div>

          {/* Info jasa */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-[#e1e3e4]" />
            <div className="h-8 w-5/6 animate-pulse rounded-lg bg-[#e1e3e4]" />
            <div className="h-5 w-24 animate-pulse rounded bg-[#e1e3e4]" />
            {/* Harga mulai */}
            <div className="h-10 w-48 animate-pulse rounded-xl bg-[#e1e3e4]" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#e1e3e4]" />
            {/* Deskripsi */}
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-[#e1e3e4]" style={{ width: i === 3 ? "65%" : "100%" }} />
              ))}
            </div>
            {/* CTA */}
            <div className="mt-4 h-12 w-full animate-pulse rounded-2xl bg-[#e1e3e4]" />
          </div>
        </div>

        {/* Paket / detail tambahan */}
        <div className="mt-10">
          <div className="mb-4 h-6 w-36 animate-pulse rounded-lg bg-[#e1e3e4]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-[#e1e3e4] bg-white p-5">
                <div className="h-5 w-20 rounded bg-[#e1e3e4]" />
                <div className="mt-3 h-7 w-28 rounded bg-[#e1e3e4]" />
                <div className="mt-4 flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-3 w-full rounded bg-[#e1e3e4]" />
                  ))}
                </div>
                <div className="mt-5 h-10 w-full rounded-xl bg-[#e1e3e4]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
