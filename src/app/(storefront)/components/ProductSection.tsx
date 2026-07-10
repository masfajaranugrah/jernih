import Link from "next/link";
import ProductSectionClient from "./ProductSectionClient";

function Icon({ children, className = "" }: { children: string; className?: string }) {
  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {children === "arrow_forward" && <path d="M13 5 20 12l-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z" />}
    </svg>
  );
}

export default function ProductSection() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#191c1d]">Produk Populer</h2>
        <Link href="/produk" className="flex items-center gap-1 text-sm font-bold text-[#064e3b] hover:underline">
          Lihat Semua <Icon className="text-base">arrow_forward</Icon>
        </Link>
      </div>
      {/* Data fetching real-time via TanStack Query (no Next.js cache) */}
      <ProductSectionClient />
    </section>
  );
}
