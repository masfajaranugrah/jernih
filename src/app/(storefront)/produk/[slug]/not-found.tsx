import Link from "next/link";
import Image from "next/image";
import { fetchProducts, formatRupiah } from "@/lib/api";

// Ambil produk, jasa, sewa statis sebagai rekomendasi acak
const staticItems = [
  {
    type: "Jasa",
    title: "Jasa Desain Arsitektur",
    price: "Mulai Rp5.000.000",
    href: "/jasa",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDam7AoTUxyTpwJi-Vqi1k4VTBlBhpo3btRjxYUrYkCg-GhSMikssj4qrJXuPISCBOPDX5PX7Ph4uGHLewFvH-d6UPeB0qK3-h7obAQMUAtysf4Q3RRKOjkVkfgEMNpxSVBt5e8X5hw6mXszLuG8CeimbUj3Cdc6cVp20ILIetFenR02yMNv3fH4qRBdsZh4cg3qUSTtNo6wxt-rQeWXMHwByDLXh0MKkbx1UTosGWVr7sibTpj-bQB",
  },
  {
    type: "Sewa",
    title: "Sewa Excavator",
    price: "Rp2.500.000/hari",
    href: "/sewa",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK9IUe7JHNkZxCaaknRPRrcpzsawQkvEcob3fdM1Ui5oUkvevWYxF21q7NrRICd7xM0l2pYyEy9fGY5XquX79OAVYrd5YpMtnoksM6Onitu6SG-tGLm4zzFDaW8BY5ehJ-d_EIWG9x0uiXYMQCpFE_seKvnzVCDUNpuVi-T7_U6ub6RitsZhBzd77Iwto93ubrJV3YNq_22QRprKdgi-48YsOpZJD3D9cBYm28o1sPTs2waTTzI56x",
  },
  {
    type: "Jasa",
    title: "Jasa Renovasi Rumah",
    price: "Mulai Rp10.000.000",
    href: "/jasa",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDam7AoTUxyTpwJi-Vqi1k4VTBlBhpo3btRjxYUrYkCg-GhSMikssj4qrJXuPISCBOPDX5PX7Ph4uGHLewFvH-d6UPeB0qK3-h7obAQMUAtysf4Q3RRKOjkVkfgEMNpxSVBt5e8X5hw6mXszLuG8CeimbUj3Cdc6cVp20ILIetFenR02yMNv3fH4qRBdsZh4cg3qUSTtNo6wxt-rQeWXMHwByDLXh0MKkbx1UTosGWVr7sibTpj-bQB",
  },
  {
    type: "Sewa",
    title: "Sewa Genset",
    price: "Rp500.000/hari",
    href: "/sewa",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK9IUe7JHNkZxCaaknRPRrcpzsawQkvEcob3fdM1Ui5oUkvevWYxF21q7NrRICd7xM0l2pYyEy9fGY5XquX79OAVYrd5YpMtnoksM6Onitu6SG-tGLm4zzFDaW8BY5ehJ-d_EIWG9x0uiXYMQCpFE_seKvnzVCDUNpuVi-T7_U6ub6RitsZhBzd77Iwto93ubrJV3YNq_22QRprKdgi-48YsOpZJD3D9cBYm28o1sPTs2waTTzI56x",
  },
];

export default async function NotFound() {
  // Ambil produk dari backend untuk rekomendasi
  const products = await fetchProducts({ limit: 6 });

  // Gabung produk dari DB + item statis, acak
  const allItems = [
    ...products.slice(0, 3).map((p) => ({
      type: p.category?.name ?? "Produk",
      title: p.name,
      price: formatRupiah(p.price),
      href: `/produk/${p.slug}`,
      img: p.images[0] ?? "/placeholder.png",
    })),
    ...staticItems,
  ].sort(() => Math.random() - 0.5).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float-anim { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Main hero section */}
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute bottom-20 left-10 h-48 w-48 rounded-full bg-[#dbeafe] opacity-20 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 right-10 h-64 w-64 rounded-full bg-[#dce2f7] opacity-20 blur-[100px]" />

        {/* Floating icon */}
        <div className="float-anim mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-xl">
          <span className="material-symbols-outlined text-[64px] text-[#bfc9c3]">search_off</span>
        </div>

        {/* Text */}
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#1e3a8a] sm:text-4xl md:text-5xl">
          Maaf, Barang Tidak Ditemukan
        </h1>
        <p className="mb-8 max-w-md text-base text-[#707974]">
          Produk yang kamu cari tidak tersedia atau sudah tidak ada. Coba cari dengan kata kunci lain atau jelajahi koleksi kami.
        </p>

        {/* Search bar */}
        <form action="/produk" method="get" className="mb-8 flex w-full max-w-md overflow-hidden rounded-full border border-[#bfc9c3] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#1e3a8a]">
          <div className="flex items-center pl-4 pr-2">
            <span className="material-symbols-outlined text-[#707974]">search</span>
          </div>
          <input
            name="search"
            type="text"
            placeholder="Cari produk, jasa, atau sewa..."
            className="flex-1 border-none bg-transparent py-3 text-sm text-[#191c1d] outline-none placeholder:text-[#bfc9c3]"
          />
          <button
            type="submit"
            className="m-1.5 rounded-full bg-[#1e3a8a] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1e40af] active:scale-95"
          >
            Cari
          </button>
        </form>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af] hover:shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Kembali ke Beranda
          </Link>
          <Link
            href="/produk"
            className="flex items-center gap-2 rounded-full border border-[#bfc9c3] bg-white px-6 py-3 text-sm font-semibold text-[#191c1d] transition hover:border-[#1e3a8a] hover:text-[#1e3a8a] active:scale-95"
          >
            <span className="material-symbols-outlined text-base">grid_view</span>
            Lihat Semua Produk
          </Link>
        </div>

        {/* Category chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { label: "Produk", href: "/produk" },
            { label: "Jasa", href: "/jasa" },
            { label: "Sewa", href: "/sewa" },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="rounded-full border border-[#bfc9c3] px-4 py-2 text-xs font-semibold text-[#707974] transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </main>

      {/* Recommendations */}
      <section className="bg-white py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-2xl font-bold text-[#1e3a8a]">
            Rekomendasi Untuk Kamu
          </h2>
          <p className="mb-10 text-center text-sm text-[#707974]">
            Produk, jasa, dan layanan sewa pilihan kami
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {allItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#edeeef]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] shadow-sm">
                    {item.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-[#191c1d] group-hover:text-[#1e3a8a]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-base font-bold text-[#191c1d]">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
