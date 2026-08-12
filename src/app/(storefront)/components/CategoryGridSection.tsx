import Link from "next/link";

// ── Category Grid Data (10 Items 5x2) ──────────────────────────────────
const categoryGridItems = [
  {
    name: "Phone & Tablet",
    href: "/produk?category=phone-tablet",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={3} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Laptop",
    href: "/produk?category=laptop",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="4" y="4" width="16" height="11" rx="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 19h20v-2a1 1 0 00-1-1H3a1 1 0 00-1 1v2z" />
      </svg>
    ),
  },
  {
    name: "PC & AIO",
    href: "/produk?category=pc-aio",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="18" height="12" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-6v6" />
      </svg>
    ),
  },
  {
    name: "Smartwatch",
    href: "/produk?category=smartwatch",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="7" y="6" width="10" height="12" rx="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v3H9zM9 18h6v3H9z" />
      </svg>
    ),
  },
  {
    name: "Printer & Aksesoris",
    href: "/produk?category=printer",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V4h12v5M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-12 0v4h12v-4" />
      </svg>
    ),
  },
  {
    name: "Console",
    href: "/produk?category=console",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="7" width="18" height="10" rx="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h3m-1.5-1.5v3M15 11h.01M17 13h.01" />
      </svg>
    ),
  },
  {
    name: "Network",
    href: "/produk?category=network",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    name: "TV",
    href: "/produk?category=tv",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="2" y="5" width="20" height="13" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21l3-3m7 3l-3-3" />
      </svg>
    ),
  },
  {
    name: "Monitor",
    href: "/produk?category=monitor",
    icon: (
      <svg className="h-7 w-7 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8m-4-4v4" />
      </svg>
    ),
  },
  {
    name: "Lihat Semua",
    href: "/produk",
    isActionButton: true,
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];

export default function CategoryGridSection() {
  return (
    <section className="mx-auto w-full py-2 select-none md:max-w-[860px] lg:max-w-[940px]">
      {/* Mobile horizontal scroll, desktop tetap satu baris compact dan seimbang. */}
      <div className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:justify-between md:gap-0 md:overflow-visible">
        {categoryGridItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`group flex w-20 shrink-0 snap-start flex-col items-center gap-2 text-center transition-transform active:scale-95 md:w-20 lg:w-22 ${
              item.isActionButton ? "hidden" : ""
            }`}
          >
            {/* Box Icon */}
            <div
              className={`flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-translate-y-1 ${
                item.isActionButton
                  ? "bg-black shadow-md text-white group-hover:bg-neutral-800"
                  : "border border-neutral-100 bg-neutral-50 shadow-xs group-hover:border-neutral-200 group-hover:bg-white group-hover:shadow-md"
              }`}
            >
              {item.icon}
            </div>

            {/* Nama Label Kategori */}
            <span
              className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors line-clamp-2 ${
                item.isActionButton
                  ? "font-bold text-black group-hover:text-neutral-700"
                  : "text-neutral-800 group-hover:text-black"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
