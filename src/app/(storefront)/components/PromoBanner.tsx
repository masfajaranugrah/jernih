import Link from "next/link";
import { fetchPromoBanner, formatRupiah } from "@/lib/api";
import { resolveImageUrl } from "@/lib/image-url";
import PromoBannerClient from "./PromoBannerClient";

/**
 * Banner promo utama di homepage — memakai data promo produk yang sedang aktif.
 * Menampilkan judul, deskripsi, gambar, tombol Belanja Sekarang, dan countdown.
 */
export default async function PromoBanner() {
  let banner;
  try {
    banner = await fetchPromoBanner();
  } catch {
    return null;
  }
  if (!banner || !banner.product) return null;

  const ctaHref = banner.product.slug ? `/produk/${banner.product.slug}` : "/promo";

  return (
    <section aria-label="Banner promo" className="w-full px-4 md:px-8">
      <div
        className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 overflow-hidden rounded-[28px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10 md:rounded-[36px]"
        style={{ backgroundColor: banner.bannerBg || "#064e3b" }}
      >
        {/* Dekorasi lingkaran transparan */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-black/10" aria-hidden="true" />

        {/* Konten teks */}
        <div className="relative z-10 min-w-0 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
            <span aria-hidden="true">🔥</span> Promo Spesial
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
              {banner.subtitle}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-lg font-black text-white sm:text-2xl">
              {formatRupiah(banner.promoPrice)}
            </span>
            {banner.product.price && Number(banner.promoPrice) < Number(banner.product.price) && (
              <span className="text-sm font-medium text-white/70 line-through">
                {formatRupiah(banner.product.price)}
              </span>
            )}
            {banner.discountPercent > 0 && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-black">
                -{Math.round(banner.discountPercent)}%
              </span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
            >
              Belanja Sekarang
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </Link>
            <PromoBannerClient endDate={banner.endsAt} />
          </div>
        </div>

        {/* Gambar produk */}
        {banner.product.images && banner.product.images.length > 0 && (
          <div className="relative z-10 mx-auto h-44 w-44 shrink-0 sm:mx-0 sm:h-56 sm:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(banner.product.images[0])}
              alt={banner.product.name}
              className="h-full w-full rounded-2xl object-cover shadow-2xl ring-4 ring-white/20"
            />
          </div>
        )}
      </div>
    </section>
  );
}