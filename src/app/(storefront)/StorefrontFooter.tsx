import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const companyLinks = [
  { label: "Services", href: "/jasa" },
  { label: "Products", href: "/produk" },
  { label: "About Us", href: "/tentang" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#", active: true },
  { label: "Terms of Service", href: "#" },
];

const paymentMethods = [
  { src: "/pyment/bca.png.webp", label: "BCA" },
  { src: "/pyment/mandiri.png.webp", label: "Mandiri" },
  { src: "/pyment/bni.png.webp", label: "BNI" },
  { src: "/pyment/cimb-niaga.png.webp", label: "CIMB Niaga" },
  { src: "/pyment/permata-2.png.webp", label: "Permata" },
  { src: "/pyment/visa.png.webp", label: "Visa" },
  { src: "/pyment/mastercard.png.webp", label: "Mastercard" },
  { src: "/pyment/jcb.png.webp", label: "JCB" },
  { src: "/pyment/gopay.png.webp", label: "GoPay" },
  { src: "/pyment/dana.png.webp", label: "DANA" },
  { src: "/pyment/ovo-2.png.webp", label: "OVO" },
  { src: "/pyment/linkaja.png.webp", label: "LinkAja" },
  { src: "/pyment/sakuku.png.webp", label: "SakuKu" },
  { src: "/pyment/jenius.png.webp", label: "Jenius" },
  { src: "/pyment/kredivo.png.webp", label: "Kredivo" },
  { src: "/pyment/home-credit.png.webp", label: "Home Credit" },
  { src: "/pyment/alfamart-2.png.webp", label: "Alfamart" },
  { src: "/pyment/indomaret-footer-2.png.webp", label: "Indomaret" },
  { src: "/pyment/oneklik.png.webp", label: "OneKlik" },
];

const shippingMethods = [
  { src: "/pyment/JNE.png.webp", label: "JNE" },
  { src: "/pyment/JnT.png.webp", label: "J&T" },
  { src: "/pyment/Sicepat.png.webp", label: "SiCepat" },
  { src: "/pyment/Gosend.png.webp", label: "GoSend" },
  { src: "/pyment/Wahana.png.webp", label: "Wahana" },
  { src: "/pyment/Anteraja.png.webp", label: "Anteraja" },
];

function FooterIcon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    public: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3.1a15.6 15.6 0 0 0-1-5 8.03 8.03 0 0 1 4.1 5ZM12 4.1c.7 1 1.4 3.2 1.7 6.9h-3.4c.3-3.7 1-5.9 1.7-6.9ZM4.3 13h3.8c.1 1.8.4 3.5.9 5a8.05 8.05 0 0 1-4.7-5Zm3.8-2H4.3A8.05 8.05 0 0 1 9 6c-.5 1.5-.8 3.2-.9 5Zm3.9 8.9c-.7-1-1.4-3.2-1.7-6.9h3.4c-.3 3.7-1 5.9-1.7 6.9Zm2.8-1.9c.5-1.5.8-3.2.9-5h3.1a8.03 8.03 0 0 1-4 5Z" />,
    leaf: <path d="M19.8 3.2C12.3 3.4 6 7.1 6 13.5c0 .8.1 1.6.4 2.3L3 19.2 4.4 20.6l3.1-3.1c1 .9 2.4 1.5 4 1.5 5.7 0 8.9-5.3 8.5-15.8h-.2ZM11.5 17c-1 0-1.9-.3-2.5-.9l4.8-4.8-1.4-1.4-4.6 4.6c-.1-.3-.1-.7-.1-1 0-4.5 4.3-7.4 10.4-8-.2 7.5-2.5 11.5-6.6 11.5Z" />,
    analytics: <path d="M4 19h16v2H4V3h2v16Zm4-2V9h3v8H8Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z" />,
    card: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11ZM5 8h14V6.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5V8Zm0 3v6.5c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V11H5Zm2 4h5v2H7v-2Z" />,
    wallet: <path d="M4 5h14a2 2 0 0 1 2 2v1h-2V7H4.5a.5.5 0 0 0 0 1H20a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2Zm1 5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1h-4a3 3 0 0 1 0-6h4a1 1 0 0 0-1-1H5Zm11 2a1 1 0 1 0 0 2h4v-2h-4Z" />,
    truck: <path d="M3 5h12v10h1.5l1.5-2v-3h-2V8h3l3 4v3h-2.1a3 3 0 0 1-5.8 0H9.9a3 3 0 0 1-5.8 0H3V5Zm4 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
    box: <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 2.3L6.2 7.5 12 10.7l5.8-3.2L12 4.3ZM5 9.2v6.6l6 3.3v-6.6L5 9.2Zm8 9.9 6-3.3V9.2l-6 3.3v6.6Z" />,
    speed: <path d="M12 4a10 10 0 0 1 9.6 12.8l-.2.7h-3.2l.5-1.3A7 7 0 1 0 5.3 16l.5 1.5H2.6l-.2-.7A10 10 0 0 1 12 4Zm4.6 4.4 1.4 1.4-4.7 4.7a2 2 0 1 1-1.4-1.4l4.7-4.7Z" />,
  };

  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function StorefrontFooter() {
  return (
    <footer className="w-full bg-white">
      <div className="border-t-2 border-dashed border-[#cbd5e1]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4 md:px-12 md:py-20">
          <div className="space-y-6">
            <div className="text-2xl font-extrabold tracking-tight text-[#1e3a8a]">Jernih Creative</div>
            <p className="max-w-sm text-base leading-7 text-[#475569]">
              Menyediakan segala produk, jasa, dan layanan sewa untuk kebutuhan kreatif Anda.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e3a8a]">Perusahaan</h4>
            <nav className="flex flex-col gap-3" aria-label="Footer perusahaan">
              {companyLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-base text-[#475569] transition-colors hover:text-[#1e3a8a]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e3a8a]">Legal</h4>
            <nav className="flex flex-col gap-3" aria-label="Footer legal">
              {legalLinks.map((item) => (
                <Link key={item.label} href={item.href} className={`text-base transition-colors hover:text-[#1e3a8a] ${item.active ? "font-bold text-[#1e3a8a]" : "text-[#475569]"}`}>
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-6 pt-2 text-2xl text-[#475569]">
                <FooterIcon name="public" className="cursor-pointer transition-colors hover:text-[#1e3a8a]" />
                <FooterIcon name="leaf" className="cursor-pointer transition-colors hover:text-[#1e3a8a]" />
                <FooterIcon name="analytics" className="cursor-pointer transition-colors hover:text-[#1e3a8a]" />
              </div>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e3a8a]">Metode Pembayaran</h4>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((item) => (
                <Image
                  key={item.label}
                  src={item.src}
                  alt={item.label}
                  width={48}
                  height={32}
                  className="h-8 w-auto rounded border border-[#e2e8f0] bg-white object-contain"
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#e2e8f0]">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row md:px-12">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#94a3b8]">Pengiriman</span>
              {shippingMethods.map((item) => (
                <Image
                  key={item.label}
                  src={item.src}
                  alt={item.label}
                  width={48}
                  height={32}
                  className="h-7 w-auto rounded border border-[#e2e8f0] bg-white object-contain"
                  unoptimized
                />
              ))}
            </div>
            <div className="text-xs font-medium text-[#94a3b8]">Jernih Creative © 2026</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
