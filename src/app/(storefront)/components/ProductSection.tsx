import Image from "next/image";
import Link from "next/link";
import { fetchProducts, formatRupiah, type ApiProduct } from "@/lib/api";

function Icon({ children, className = "" }: { children: string; className?: string }) {
  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {children === "star" && <path d="m12 2 2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2Z" />}
      {children === "arrow_forward" && <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />}
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
          <Icon className="text-base text-amber-500">star</Icon>
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

export default async function ProductSection() {
  const products = await fetchProducts({ limit: 8 });

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#191c1d]">Produk Populer</h2>
        <Link href="/produk" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
          Lihat Semua <Icon className="text-base">arrow_forward</Icon>
        </Link>
      </div>
      <div className="mt-5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {products.map((product) => (
          <div key={product.id} className="w-[160px] flex-shrink-0 snap-start md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
