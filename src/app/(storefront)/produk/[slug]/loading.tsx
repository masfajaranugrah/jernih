/**
 * loading.tsx — skeleton halaman detail produk
 * Meniru layout: gambar galeri kiri + info produk kanan
 */
export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-4 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-4 animate-pulse rounded bg-[#e1e3e4]" />
          <div className="h-4 w-40 animate-pulse rounded bg-[#e1e3e4]" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Galeri gambar — kiri */}
          <div className="flex flex-col gap-3 lg:w-1/2">
            <div className="aspect-square w-full animate-pulse rounded-3xl bg-[#e1e3e4]" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square w-16 animate-pulse rounded-xl bg-[#e1e3e4]" />
              ))}
            </div>
          </div>

          {/* Info produk — kanan */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            {/* Badge kategori */}
            <div className="h-5 w-20 animate-pulse rounded-full bg-[#e1e3e4]" />
            {/* Nama produk */}
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-[#e1e3e4]" />
            <div className="h-8 w-1/2 animate-pulse rounded-lg bg-[#e1e3e4]" />
            {/* Rating */}
            <div className="h-4 w-32 animate-pulse rounded bg-[#e1e3e4]" />
            {/* Harga */}
            <div className="h-10 w-40 animate-pulse rounded-xl bg-[#e1e3e4]" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#e1e3e4]" />
            {/* Stok */}
            <div className="h-4 w-36 animate-pulse rounded bg-[#e1e3e4]" />
            {/* Tombol */}
            <div className="mt-2 flex gap-3">
              <div className="h-12 flex-1 animate-pulse rounded-2xl bg-[#e1e3e4]" />
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#e1e3e4]" />
            </div>
            {/* Deskripsi */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-4 w-full animate-pulse rounded bg-[#e1e3e4]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#e1e3e4]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#e1e3e4]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#e1e3e4]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
