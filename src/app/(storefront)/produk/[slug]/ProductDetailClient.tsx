"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Product = {
  title: string;
  category: string;
  price: string;
  installment: string;
  stock: string;
  image: string;
  description: string;
  details: string[];
  specs: string[][];
  gallery: string[];
};

function Icon({ children, className = "" }: { children: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    chevron_right: <path d="m9 18 6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18Z" />,
    compare_arrows: <path d="M10 3 6 7l4 4V8h10V6H10V3Zm4 10v3H4v2h10v3l4-4-4-4Z" />,
    local_shipping: <path d="M3 5h12v10h2.2l1.8-2v-3h-2V8h3l2 3v4h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2V7a2 2 0 0 1 1-2Zm3 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
    storefront: <path d="M4 10h16l-1-5H5l-1 5Zm1 2v8h14v-8h-2v6h-4v-6H5Zm2 0h4v6H7v-6Z" />,
    remove: <path d="M5 11h14v2H5v-2Z" />,
    add: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />,
    store: <path d="M4 10h16l-1-5H5l-1 5Zm1 2v8h14v-8h-2v6H7v-6H5Z" />,
    autorenew: <path d="M12 5a7 7 0 0 1 6.3 4H16l3.5 3.5L23 9h-2.6A9 9 0 0 0 4.7 4.7L6.1 6.1A7 7 0 0 1 12 5Zm-7.5 6.5L1 15h2.6a9 9 0 0 0 15.7 4.3l-1.4-1.4A7 7 0 0 1 5.7 15H8l-3.5-3.5Z" />,
    favorite_border: <path d="m12 21-1.5-1.3C5.4 15.1 2 12 2 8.2 2 5.1 4.4 3 7.4 3c1.7 0 3.4.8 4.6 2.1A6.1 6.1 0 0 1 16.6 3C19.6 3 22 5.1 22 8.2c0 3.8-3.4 6.9-8.5 11.5L12 21Zm0-2.7.1-.1C16.8 14 20 11.1 20 8.2 20 6.2 18.5 5 16.6 5c-1.5 0-3 .9-3.6 2.2h-2C10.4 5.9 8.9 5 7.4 5 5.5 5 4 6.2 4 8.2c0 2.9 3.2 5.8 7.9 10l.1.1Z" />,
  };

  return (
    <svg className={`inline-block h-[1em] w-[1em] fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {icons[children]}
    </svg>
  );
}

function InfoRow({ icon, title, children, action }: { icon: string; title: string; children: React.ReactNode; action?: string }) {
  return (
    <div className="border-t border-gray-200 py-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 text-[#064e3b]">{icon}</Icon>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-950">{title}</h3>
          <div className="mt-1 text-sm leading-6 text-gray-600">{children}</div>
        </div>
        {action ? <button className="hidden shrink-0 text-sm font-bold text-[#064e3b] hover:underline sm:block">{action}</button> : null}
      </div>
      {action ? <button className="mt-2 text-sm font-bold text-[#064e3b] hover:underline sm:hidden">{action}</button> : null}
    </div>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const [quantity, setQuantity] = useState(1);
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const whatsappNumber = "6281318638100";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo, saya ingin memesan:\n\n*${product.title}*\nJumlah: ${quantity}\nHarga: ${product.price}\n\nMohon informasi lebih lanjut. Terima kasih 🙏`,
  )}`;

  return (
    <div className="min-h-screen bg-white pb-28 text-gray-800">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <ol className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
          <li><Link className="font-bold text-[#064e3b] hover:underline" href="/">Home</Link></li>
          <li><Icon className="text-base">chevron_right</Icon></li>
          <li><Link className="hover:underline hover:text-[#064e3b]" href="/produk">Produk</Link></li>
          <li><Icon className="text-base">chevron_right</Icon></li>
          <li aria-current="page" className="truncate font-medium text-gray-800">{product.title}</li>
        </ol>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-2 md:px-6 lg:pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
          <section>
            <div className="relative flex h-[340px] items-center justify-center rounded-3xl bg-gray-50 p-6 md:h-[560px]">
              <Image src={gallery[activeImage]} alt={product.title} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain p-6 md:p-10" />
            </div>

            <div className="scrollbar-hide mt-5 flex justify-start gap-4 overflow-x-auto pb-2 md:justify-center">
              {gallery.map((image, index) => (
                <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} className={`relative h-20 w-20 shrink-0 rounded-xl bg-white p-1 ${index === activeImage ? "border-2 border-[#064e3b]" : "border border-gray-200 hover:border-gray-400"}`}>
                  <Image src={image} alt={`${product.title} thumbnail ${index + 1}`} fill sizes="80px" className="object-contain p-1" />
                </button>
              ))}
            </div>

            <div className="mt-10 border-b border-gray-200">
              <div className="flex gap-8 overflow-x-auto">
                <button onClick={() => setActiveTab("description")} className={`border-b-2 pb-4 text-lg font-black ${activeTab === "description" ? "border-[#064e3b] text-[#064e3b]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Deskripsi</button>
                <button onClick={() => setActiveTab("specs")} className={`border-b-2 pb-4 text-lg font-black ${activeTab === "specs" ? "border-[#064e3b] text-[#064e3b]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Spesifikasi</button>
              </div>
            </div>

            <article className="py-6">
              {activeTab === "description" ? (
                <>
                  <h2 className="mb-2 text-xl font-black text-gray-950">{product.title}</h2>
                  <p className="mb-6 max-w-3xl whitespace-pre-line leading-7 text-gray-700">{product.description}</p>
                  <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-gray-100">
                    <Image src={gallery[activeImage]} alt={`Detail ${product.title}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
                  </div>
                </>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  {product.specs.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-4 last:border-b-0 sm:grid-cols-[220px_1fr]">
                      <div className="font-bold text-gray-950">{label}</div>
                      <div className="text-gray-600">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <aside className="lg:pt-1">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-black/5 lg:sticky lg:top-6 lg:border-0 lg:p-0 lg:shadow-none">
              <p className="mb-2 text-sm font-black uppercase tracking-widest text-[#064e3b]">{product.category}</p>
              <h1 className="text-2xl font-black leading-tight text-gray-950 sm:text-3xl">{product.title}</h1>
              {/* Hidden for now.
              <div className="mt-4 flex justify-start lg:justify-end">
                <button className="flex items-center text-sm font-bold text-[#064e3b] hover:underline"><Icon className="mr-1 text-base">compare_arrows</Icon>Bandingkan</button>
              </div>
              */}

              <div className="mt-5">
                <span className="text-sm font-bold text-orange-500">{product.stock}</span>
              </div>

              <div className="mt-6">
                <div className="text-4xl font-black tracking-tight text-gray-950">{product.price}</div>
                {/* Hidden for now.
                <a className="mt-2 flex items-center text-sm text-gray-600 hover:underline" href="#">{product.installment}<Icon className="ml-1 text-sm text-[#064e3b]">chevron_right</Icon></a>
                */}
              </div>

              <div className="mt-6">
                <label className="mb-2 block font-semibold text-gray-700">Jumlah</label>
                <div className="flex w-36 items-center rounded-xl border border-gray-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <Icon>remove</Icon>
                  </button>
                  <input
                    aria-label="Jumlah produk"
                    className="w-full border-none bg-transparent p-0 text-center font-bold text-gray-950 outline-none"
                    inputMode="numeric"
                    type="text"
                    value={quantity}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value.replace(/\D/g, ""));
                      setQuantity(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <Icon>add</Icon>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="mb-3 font-black text-gray-950">Detail Produk</h2>
                <div className="rounded-2xl border border-yellow-400 bg-yellow-50 p-4">
                  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700">
                    {product.details.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <InfoRow icon="local_shipping" title="JNE Reguler">Pengiriman andalan ke seluruh Indonesia.</InfoRow>
                <InfoRow icon="local_shipping" title="SiCepat">Pengiriman cepat ke seluruh Indonesia.</InfoRow>
                <InfoRow icon="local_shipping" title="J&T Express">Pengiriman terpercaya dengan jangkauan luas.</InfoRow>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-gray-50/95 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur md:p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden flex-1 md:block"><div className="text-xl font-black text-gray-950">{product.price}</div></div>
          <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:gap-3">
            <button className="flex h-12 items-center justify-center gap-1 rounded-xl border-2 border-[#064e3b] bg-white px-3 text-sm font-black text-[#064e3b] hover:bg-green-50 md:w-48 md:text-base">
              <Icon>add</Icon>
              Keranjang
            </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-xl bg-[#064e3b] px-5 text-sm font-black text-white transition hover:bg-[#042f2e] md:w-64 md:text-base"
          >
            Pesan Sekarang
          </a>
          </div>
        </div>
      </div>
    </div>
  );
}
