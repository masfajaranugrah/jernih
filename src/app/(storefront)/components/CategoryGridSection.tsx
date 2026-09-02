import Link from "next/link";
import Image from "next/image";

// ── Category Grid Data (10 Items 5x2) ──────────────────────────────────
const categoryGridItems = [
  {
    name: "Phone & Tablet",
    href: "/produk?category=phone-tablet",
    icon: (
      <Image
        src="/img/category/hp.png"
        alt="Phone & Tablet"
        width={44}
        height={44}
        className="h-15 w-15 sm:h-15 sm:w-15 object-contain"
      />
    ),
  },
  {
    name: "Laptop",
    href: "/produk?category=laptop",
    icon: (
      <Image
        src="/img/category/laptop.png"
        alt="Laptop"
        width={44}
        height={44}
        className="h-15 w-15 sm:h-15 sm:w-15 object-contain"
      />
    ),
  },
  {
    name: "PC & AIO",
    href: "/produk?category=pc-aio",
    icon: (
      <Image
        src="/img/category/pc.png"
        alt="Laptop"
        width={44}
        height={44}
        className="h-20 w-20 sm:h-20 sm:w-20 object-contain"
      />
    ),
  },
  {
    name: "Smartwatch",
    href: "/produk?category=smartwatch",
    icon: (
      <Image
        src="/img/category/smart.png"
        alt="Laptop"
        width={44}
        height={44}
        className="h-12 w-12 sm:h-12 sm:w-12 object-contain"
      />
    ),
  },
  {
    name: "Printer & Aksesoris",
    href: "/produk?category=printer",
    icon: (
      <Image
        src="/img/category/printer.png"
        alt="Laptop"
        width={44}
        height={44}
        className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
      />
    ),
  },
  {
    name: "Kebutuhan Rumah",
    href: "/produk?category=kebutuhan_rumah",
    icon: (
      <Image
        src="/img/category/kebutuhan_rumah.png"
        alt="Laptop"
        width={44}
        height={44}
        className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
      />
    ),
  },
  {
    name: "Network",
    href: "/produk?category=network",
    icon: (
      <Image
        src="/img/category/wifi.png"
        alt="Network"
        width={44}
        height={44}
        className="h-15 w-15 sm:h-15 sm:w-15 object-contain"
      />
    ),
  },
  {
    name: "TV",
    href: "/produk?category=tv",
    icon: (
      <Image
        src="/img/category/tv.png"
        alt="tanah"
        width={50}
        height={50}
        className="h-20 w-20 sm:h-20 sm:w-20 object-contain"
      />
    ),
  },
  {
    name: "Jual Beli Tanah",
    href: "/produk?category=monitor",
    icon: (
      <Image
        src="/img/category/tanah.png"
        alt="tanah"
        width={50}
        height={50}
        className="h-18 w-18 sm:h-18 sm:w-18 object-contain"
      />
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

// Design system colors:
// Icon container idle: bg-[#F8FAFC] border border-[#E2E8F0]
// Icon container hover: bg-[#EFF6FF] border-[#BFDBFE]
// Label text idle: text-[#0F172A]
// Label text hover: text-[#2563EB]
// Action button: bg-[#2563EB] hover:bg-[#1D4ED8]

export default function CategoryGridSection() {
  return (
    <section className="mx-auto w-full py-2 select-none md:max-w-[860px] lg:max-w-[940px]">
      {/* Mobile horizontal scroll, desktop tetap satu baris compact dan seimbang. */}
      <div className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:justify-between md:gap-0 md:overflow-visible">
        {categoryGridItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`group flex w-20 shrink-0 snap-start flex-col items-center gap-2 text-center transition-transform active:scale-95 md:w-20 lg:w-22 ${item.isActionButton ? "hidden" : ""
              }`}
          >
            {/* Box Icon */}
            <div
              className={`flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-translate-y-1 ${item.isActionButton
                ? "bg-[#2563EB] shadow-md text-white group-hover:bg-[#1D4ED8]"
                : "border border-[#E2E8F0] bg-[#F8FAFC] shadow-xs group-hover:border-[#BFDBFE] group-hover:bg-[#EFF6FF] group-hover:shadow-md"
                }`}
            >
              {item.icon}
            </div>

            {/* Nama Label Kategori */}
            <span
              className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors line-clamp-2 ${item.isActionButton
                ? "font-bold text-[#0F172A] group-hover:text-[#2563EB]"
                : "text-[#0F172A] group-hover:text-[#2563EB]"
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
