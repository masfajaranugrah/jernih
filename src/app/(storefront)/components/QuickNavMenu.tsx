import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Produk",
    href: "/produk",
    icon: (
      <svg className="h-6 w-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    label: "Sewa",
    href: "/sewa",
    icon: (
      <svg className="h-6 w-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Jasa",
    href: "/jasa",
    icon: (
      <svg className="h-6 w-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export default function QuickNavMenu() {
  return (
    <section className="w-full px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 sm:gap-12 md:gap-16 py-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col items-center gap-2 text-center transition-all duration-200 active:scale-95"
          >
            {/* Icon container — design system style */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] shadow-xs transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#DBEAFE] group-hover:shadow-md">
              {item.icon}
            </div>

            {/* Label */}
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#0F172A] transition-colors group-hover:text-[#2563EB]">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
