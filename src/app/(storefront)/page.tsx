import Image from "next/image";
import Link from "next/link";
import { getHeroData } from "@/lib/hero-store";
import { getPromoCardsFromBackend } from "@/lib/promo-actions";
import { fetchProducts, formatRupiah, type ApiProduct } from "@/lib/api";
import { fetchServices, type ApiService } from "@/lib/service-actions";
import { fetchRentalItems, type ApiRentalItem } from "@/lib/rental-actions";
import { getHomepageSections } from "@/lib/homepage-settings";

function Icon({ children, className = "" }: { children: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    storefront: (
      <path d="M4 10h16l-1-5H5l-1 5Zm1 2v8h14v-8h-2v6h-4v-6H5Zm2 0h4v6H7v-6Z" />
    ),
    search: <path d="m19.6 21-6.3-6.3a7 7 0 1 1 1.4-1.4l6.3 6.3-1.4 1.4ZM9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
    person: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0H4Z" />,
    star: <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2Z" />,
    add_shopping_cart: <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.2 6l.8 4h7.4l2.1-4H6.2ZM2 3h2.5l3 12H18v2H6L3 5H2V3Zm14 5h2V6h2v2h2v2h-2v2h-2v-2h-2V8Z" />,
    arrow_forward: <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />,
  };

  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {icons[children]}
    </svg>
  );
}

function ProductCard({ product }: { product: ApiProduct }) {
  const badgeMatch = product.description?.match(/^\[badge:([A-Z0-9]+)\]/);
  const badge = badgeMatch ? badgeMatch[1] : product.oldPrice ? "SALE" : null;
  const badgeColors: Record<string, string> = {
    SALE: "bg-[#ba1a1a]", NEW: "bg-[#064e3b]", HOT: "bg-orange-500",
    DISKON: "bg-[#1d4ed8]", TERBATAS: "bg-[#7c3aed]",
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        <Image
          src={product.images[0] ?? "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <div className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase ${badgeColors[badge] ?? "bg-[#ba1a1a]"}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#064e3b]">
          {product.category?.name}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#191c1d] sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-[#575e70]">
          <Icon className="text-base text-amber-500 [font-variation-settings:'FILL'_1]">star</Icon>
          {product.rating}
        </div>
        <div className="border-t border-[#bfc9c3]/30 pt-3">
          {product.oldPrice ? (
            <div className="text-xs text-[#707974] line-through">{formatRupiah(product.oldPrice)}</div>
          ) : null}
          <div className="text-base font-bold text-[#064e3b] sm:text-lg">{formatRupiah(product.price)}</div>
        </div>
      </div>
    </Link>
  );
}

function ServiceCard({ service }: { service: ApiService }) {
  return (
    <Link
      href={`/jasa/${service.slug}`}
      className="group overflow-hidden rounded-2xl border border-[#bfc9c3]/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-[#edeeef]">
        {service.images[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 fill-[#bfc9c3]" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 rounded bg-[#064e3b] px-2 py-0.5 text-[10px] font-black uppercase text-white">
          Jasa
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#064e3b]">
          {service.category?.name ?? "Layanan Profesional"}
        </p>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium text-[#191c1d] sm:text-base">
          {service.name}
        </h3>
        <p className="mt-4 border-t border-[#bfc9c3]/30 pt-3 text-base font-bold text-[#064e3b] sm:text-lg">
          Mulai {formatRupiah(service.priceFrom)}
          <span className="text-xs font-normal text-[#707974]">/{service.unit}</span>
        </p>
      </div>
    </Link>
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

function EmptySection({ message, href, linkLabel }: { message: string; href: string; linkLabel: string }) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-[#bfc9c3] bg-white px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3f4f5]">
        <svg className="h-7 w-7 fill-[#bfc9c3]" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[#404944]">{message}</p>
      <p className="mt-1 text-xs text-[#707974]">Belum ada data yang tersedia saat ini.</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#bfc9c3] px-4 py-1.5 text-xs font-semibold text-[#404944] transition-colors hover:border-[#064e3b] hover:text-[#064e3b]"
      >
        {linkLabel}
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />
        </svg>
      </Link>
    </div>
  );
}

export default async function Home() {
  const hero = getHeroData();
  const { main, banners } = hero;
  const [b0, b1, b2] = banners;

  // Fetch settings & data dari backend secara paralel
  const [sections, promoCards, products, services, rentalItems] = await Promise.all([
    getHomepageSections(),
    getPromoCardsFromBackend(),
    fetchProducts({ limit: 8 }),
    fetchServices(),
    fetchRentalItems(),
  ]);

  return (
    <>
      {/* Hero Bento Grid */}
      {sections.showHero && (
        <section className="w-full px-4 py-6 md:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-5 [grid-auto-rows:minmax(280px,auto)] max-lg:grid-rows-none">

          {/* Tile utama — 8 kolom, 2 baris */}
          <Link
            href={main.linkHref}
            className="group relative col-span-12 min-h-[380px] overflow-hidden rounded-3xl shadow-sm lg:col-span-8 lg:row-span-2"
            style={{ backgroundColor: main.bgColor }}
          >
            <Image
              src={main.imageUrl}
              alt={main.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay gradient dari kiri */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            {/* Konten */}
            <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center p-8 text-white sm:p-12">
              <span className="mb-5 w-fit rounded-full bg-[#064e3b]/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                {main.badge}
              </span>
              <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                {main.title}
                {main.titleSuffix && (
                  <> <span className="font-light italic">{main.titleSuffix}</span></>
                )}
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
                {main.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className={`inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#064e3b] transition-colors hover:bg-slate-100 ${main.ctaColor}`}>
                  {main.ctaText}
                </span>
                <span className="inline-block rounded-xl border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10">
                  Lihat Semua
                </span>
              </div>
            </div>
          </Link>

          {/* Banner atas kanan — 4 kolom */}
          <div
            className="group relative col-span-12 min-h-[240px] overflow-hidden rounded-3xl shadow-sm lg:col-span-4"
            style={{ backgroundColor: b0.bgColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b0.imageUrl}
              alt={b0.label}
              className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-110"
            />
            <div className={`relative z-10 flex h-full flex-col justify-between p-6 text-white sm:p-8 ${
              b0.align === "right" ? "items-end text-right" : b0.align === "center" ? "items-center text-center" : "items-start"
            }`}>
              <div className="flex w-full items-start justify-between">
                <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                  {b0.subtitle && <>{b0.subtitle}<br /></>}
                  {b0.title}
                </h2>
                {b0.label && (
                  <span className="rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-black">
                    Featured
                  </span>
                )}
              </div>
              <div>
                {b0.tagline && <p className="mb-3 text-sm text-white/70">{b0.tagline}</p>}
                {b0.ctaText ? (
                  <button className={`border-b-2 border-[#064e3b] pb-0.5 text-base font-bold text-white transition-all hover:border-white ${b0.ctaColor} ${b0.ctaTextColor}`}>
                    {b0.ctaText}
                  </button>
                ) : (
                  <span className="border-b-2 border-[#064e3b] pb-0.5 text-base font-bold text-white transition-all hover:border-white cursor-pointer">
                    Pelajari Lebih
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dua banner bawah — masing-masing 2 kolom (total 4) */}
          <div
            className="group relative col-span-6 min-h-[220px] overflow-hidden rounded-3xl shadow-sm lg:col-span-2"
            style={{ backgroundColor: b1.bgColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {b1.imageUrl && (
              <img
                src={b1.imageUrl}
                alt={b1.label}
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
              <h3 className="text-lg font-black leading-tight sm:text-xl">{b1.title}</h3>
              {b1.subtitle && <p className="mt-1 text-xs text-white/70">{b1.subtitle}</p>}
              {b1.ctaText && (
                <button className={`mt-4 w-full rounded-lg py-2.5 text-xs font-bold transition-colors ${b1.ctaColor} ${b1.ctaTextColor} hover:opacity-90`}>
                  {b1.ctaText}
                </button>
              )}
            </div>
          </div>

          <div
            className="group relative col-span-6 min-h-[220px] overflow-hidden rounded-3xl shadow-sm lg:col-span-2"
            style={{ backgroundColor: b2.bgColor }}
          >
            {/* Gambar background jika ada */}
            {b2.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b2.imageUrl}
                alt={b2.label}
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            )}
            {/* Overlay gelap agar teks terbaca */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Dekorasi blur (tetap ada sebagai aksen) */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#064e3b]/20 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-5 text-center text-white">
              {b2.tagline && (
                <span className="mb-3 rounded-full bg-[#064e3b]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#4ade80]">
                  {b2.tagline}
                </span>
              )}
              <h3 className="text-2xl font-black italic tracking-tight sm:text-3xl">
                {b2.title.includes("X") ? (
                  <>{b2.title.split("X")[0]}<span className="text-[#4ade80]">X</span>{b2.title.split("X")[1]}</>
                ) : b2.title}
              </h3>
              {b2.subtitle && <p className="mt-2 text-[11px] text-white/60">{b2.subtitle}</p>}
              {b2.ctaText && (
                <button className={`mt-5 rounded-md px-4 py-2 text-xs font-bold transition-all ${b2.ctaColor} ${b2.ctaTextColor} hover:opacity-90`}>
                  {b2.ctaText}
                </button>
              )}
            </div>
          </div>

        </div>
        </section>
      )}

      <main className="flex w-full flex-col gap-14 px-4 py-12 md:px-8 md:py-20">
        {sections.showPromo && (
          <section>
            <h2 className="text-center text-3xl font-semibold tracking-tight text-[#191c1d]">
              Promo Spesial Untuk Anda
            </h2>
            <div className="scrollbar-hide -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
              {promoCards.map((promo) => (
                <Link
                  href={promo.linkHref ?? "/produk"}
                  key={promo.id}
                  className="group relative aspect-[3/4] w-[70vw] max-w-[280px] shrink-0 snap-center overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5 sm:w-[38vw] md:w-auto md:max-w-none md:shrink"
                >
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 70vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-[#575e70] px-2.5 py-0.5 text-xs font-bold text-white">
                    PROMO
                  </div>
                  {promo.category && (
                    <div className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#191c1d]">
                      {promo.category}
                    </div>
                  )}
                  <div className="absolute inset-x-3 bottom-3 text-white">
                    <h3 className="text-xs font-bold">{promo.title}</h3>
                    <p className="mt-1 text-xl font-black text-[#b0f0d6]">{promo.price}</p>
                    <span className="mt-3 block rounded-xl bg-white py-1.5 text-center text-xs font-bold text-[#191c1d]">
                      Lihat Detail
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sections.showProduct && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#191c1d]">Produk Populer</h2>
              <Link href="/produk" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
                Lihat Semua <Icon className="text-base">arrow_forward</Icon>
              </Link>
            </div>
            {/* Mobile: scroll horizontal, Desktop: grid */}
            <div className="mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
              {products.map((product) => (
                <div key={product.id} className="w-[160px] flex-shrink-0 snap-start md:w-auto">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Jasa Profesional */}
        {sections.showJasa && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#191c1d]">Jasa Profesional</h2>
              <Link href="/jasa" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
                Lihat Semua <Icon className="text-base">arrow_forward</Icon>
              </Link>
            </div>
            {services.length === 0 ? (
              <div className="mt-5">
                <EmptySection message="Jasa tidak tersedia saat ini" href="/jasa" linkLabel="Lihat Halaman Jasa" />
              </div>
            ) : (
              <div className="mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
                {services.slice(0, 4).map((svc) => (
                  <div key={svc.id} className="w-[160px] flex-shrink-0 snap-start md:w-auto">
                    <ServiceCard service={svc} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Sewa Peralatan */}
        {sections.showSewa && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#191c1d]">Sewa Peralatan</h2>
              <Link href="/sewa" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
                Lihat Semua <Icon className="text-base">arrow_forward</Icon>
              </Link>
            </div>
            {rentalItems.length === 0 ? (
              <div className="mt-5">
                <EmptySection message="Item sewa tidak tersedia saat ini" href="/sewa" linkLabel="Lihat Halaman Sewa" />
              </div>
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
        )}
      </main>

      <footer className="flex w-full flex-col items-center justify-between gap-5 border-t border-[#bfc9c3] bg-[#f3f4f5] px-4 py-10 text-center md:flex-row md:px-8">
        <div className="text-2xl font-bold text-[#064e3b]">Jernih Creatife</div>
        <div className="flex flex-wrap justify-center gap-5 text-xs font-semibold text-[#404944]">
          {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Help Center'].map((item) => (
            <a key={item} href="#" className="underline hover:text-[#064e3b]">
              {item}
            </a>
          ))}
        </div>
        <p className="text-xs font-medium text-[#404944]">© 2024 Jernih Creatife. All rights reserved.</p>
      </footer>
    </>
  );
}
