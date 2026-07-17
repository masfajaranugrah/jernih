import Link from "next/link";
import StorefrontFooter from "@/app/(storefront)/StorefrontFooter";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#cbd5e1] bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#1e3a8a]">
            <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 10h16l-1-5H5l-1 5Zm1 2v8h14v-8h-2v6h-4v-6H5Zm2 0h4v6H7v-6Z" />
            </svg>
            <span className="text-lg font-extrabold tracking-tight">Jernih Creative</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#475569] transition-colors hover:text-[#1e3a8a]"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>arrow_back</span>
            Kembali ke Toko
          </Link>
        </div>
      </header>
      {children}
      <StorefrontFooter />
    </>
  );
}
