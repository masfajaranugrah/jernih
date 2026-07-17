"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApiService } from "@/lib/service-actions";

function formatRupiah(val: string | number) {
  return "Rp " + parseFloat(String(val)).toLocaleString("id-ID");
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<span key={i} className="material-symbols-outlined text-sm text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>);
    else if (rating >= i - 0.5) stars.push(<span key={i} className="material-symbols-outlined text-sm text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>);
    else stars.push(<span key={i} className="material-symbols-outlined text-sm text-[#bfc9c3]">star</span>);
  }
  return <div className="flex">{stars}</div>;
}

type TabId = "deskripsi" | "paket" | "portofolio";

function parsePackages(description: string | null | undefined) {
  if (!description) return null;
  try {
    const start = description.indexOf("||PACKAGES_START||");
    const end = description.indexOf("||PACKAGES_END||");
    if (start !== -1 && end !== -1) {
      const json = description.slice(start + "||PACKAGES_START||".length, end);
      return JSON.parse(json);
    }
  } catch { /* ignore */ }
  return null;
}

function cleanDescription(description: string | null | undefined) {
  if (!description) return "";
  const start = description.indexOf("||PACKAGES_START||");
  if (start === -1) return description.trim();
  return description.slice(0, start).trim();
}

const PHONE_NUMBER = "6281234567890";

function ShareModal({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";

  const shareLinks = [
    {
      name: "Facebook", color: "bg-[#1877f2]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "Twitter", color: "bg-[#000000]",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "WhatsApp", color: "bg-[#25d366]",
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    },
    {
      name: "LinkedIn", color: "bg-[#0a66c2]",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram", color: "bg-[#0088cc]",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
  ];

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0b1c30]">Bagikan</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {shareLinks.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 ${s.color} rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-xl">
                  {s.name === "Facebook" ? "facebook" : s.name === "Twitter" ? "X" : s.name === "WhatsApp" ? "chat" : s.name === "LinkedIn" ? "work" : "send"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#737784] text-center">{s.name}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export default function JasaDetailClient({ service }: { service: ApiService }) {
  const [activeTab, setActiveTab] = useState<TabId>("deskripsi");
  const [activeImg, setActiveImg] = useState(0);
  const [activePkg, setActivePkg] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const images = service.images ?? [];
  const packages = parsePackages(service.description);
  const description = cleanDescription(service.description);
  const currentPkg = packages?.[activePkg] ?? null;

  const TABS: { id: TabId; label: string }[] = [
    { id: "deskripsi", label: "Deskripsi" },
    { id: "paket", label: "Paket Layanan" },
    { id: "portofolio", label: "Portofolio" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0;24,400,1,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
        .active-tab { border-bottom: 2px solid #003c90; color: #003c90; }
      `}</style>

      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#737784] mb-8">
          <Link href="/" className="hover:text-[#003c90] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/jasa" className="hover:text-[#003c90] transition-colors">Jasa</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-[#0b1c30] font-medium line-clamp-1">{service.name}</span>
        </nav>

        {/* Hero: Gallery + Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

          {/* Left: Carousel + Info */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main image */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#e5eeff] shadow-sm group">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl text-[#737784]">design_services</span>
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#0b1c30] hover:bg-white transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#0b1c30] hover:bg-white transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? "border-[#003c90] opacity-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {images.length > 4 && (
                  <button className="flex-shrink-0 w-24 aspect-video rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#737784] hover:text-[#003c90] hover:bg-[#dce9ff] transition-colors">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                  </button>
                )}
              </div>
            )}

            {/* Title + Description (always visible on left) */}
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[#d3e4fe] text-[#003c90] text-xs font-semibold rounded-full">
                  {service.category?.name ?? "Layanan"}
                </span>
                {service.rating > 0 && (
                  <div className="flex items-center gap-1 text-[#003c90]">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-semibold ml-1">{service.rating.toFixed(1)} ({Math.floor(service.rating * 27)} ulasan)</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0b1c30] mb-4 leading-tight">{service.name}</h1>
              {description && (
                <p className="text-base md:text-lg text-[#434653] leading-relaxed max-w-2xl">{description}</p>
              )}
            </div>
          </div>

          {/* Right: Package Switcher */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white rounded-xl border border-[#c3c6d5] shadow-sm p-6 lg:p-8">
              {/* Package Tabs */}
              {packages && packages.length > 0 && (
                <div className="flex p-1 bg-[#e5eeff] rounded-lg mb-6" role="tablist">
                  {packages.map((pkg: { name: string }, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActivePkg(i)}
                      className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold transition-colors focus:outline-none ${
                        activePkg === i
                          ? "bg-white shadow-sm text-[#003c90]"
                          : "text-[#434653] hover:text-[#003c90]"
                      }`}
                      role="tab"
                      aria-selected={activePkg === i}
                    >
                      {pkg.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Package Content */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-lg font-bold text-[#0b1c30]">{currentPkg?.name ?? "Paket"}</h2>
                  <span className="text-2xl font-bold text-[#003c90]">
                    {currentPkg?.price ? formatRupiah(currentPkg.price) : formatRupiah(service.priceFrom)}
                  </span>
                </div>
                <p className="text-sm text-[#434653] mb-6">
                  {currentPkg?.name === "Basic"
                    ? "Cocok untuk kebutuhan dasar."
                    : currentPkg?.name === "Pro"
                    ? "Sempurna untuk bisnis yang berkembang."
                    : currentPkg?.name === "Enterprise"
                    ? "Solusi lengkap untuk skala besar."
                    : `Mulai dari ${formatRupiah(service.priceFrom)}/${service.unit}`}
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {(currentPkg?.features ?? []).slice(0, 5).map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#006a61] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-sm text-[#434653]">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery estimate */}
                <div className="flex items-center gap-2 mb-6 text-xs text-[#737784]">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>Estimasi pengerjaan: 14-21 hari</span>
                </div>

                {/* Buttons */}
                <a
                  href={`https://wa.me/${PHONE_NUMBER}?text=Halo%20saya%20tertarik%20dengan%20${encodeURIComponent(service.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-[#003c90] text-white font-semibold text-sm py-4 rounded-lg hover:bg-[#0f52ba] transition-colors shadow-sm"
                >
                  <span>Konsultasi Sekarang</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
                <button
                  onClick={() => setShareOpen(true)}
                  className="flex w-full items-center justify-center gap-2 mt-3 border border-[#003c90] text-[#003c90] font-semibold text-sm py-4 rounded-lg hover:bg-[#d9e2ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Provider info */}
        {service.mitra && (
          <div className="flex items-center gap-3 mb-10 p-4 bg-white rounded-xl border border-[#c3c6d5]">
            <div className="w-10 h-10 rounded-full bg-[#003c90] flex items-center justify-center flex-shrink-0">
              {service.mitra.logo ? (
                <img src={service.mitra.logo} alt="logo" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-white text-xs font-bold">{service.mitra.storeName.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-[#737784]">Disediakan oleh</p>
              <p className="text-sm font-semibold text-[#003c90]">{service.mitra.storeName}</p>
            </div>
          </div>
        )}

        {/* Tabs: Deskripsi / Paket / Portofolio */}
        <div className="pb-16">
          <div className="flex border-b border-[#c3c6d5] mb-6 gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id ? "active-tab" : "text-[#737784] hover:text-[#003c90]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "deskripsi" && (
            <div className="space-y-8 py-4 max-w-4xl">
              <div>
                <h3 className="text-xl font-bold text-[#003c90] mb-4">Proses Layanan yang Terpersonalisasi</h3>
                {description ? (
                  <p className="whitespace-pre-line text-[#434653] text-sm leading-relaxed">{description}</p>
                ) : (
                  <p className="text-[#737784] italic text-sm">Belum ada deskripsi untuk jasa ini.</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { step: "1", title: "Discovery & Briefing", desc: "Pertemuan awal untuk memahami kebutuhan, gaya, dan anggaran Anda secara mendalam." },
                  { step: "2", title: "Konsep & Moodboard", desc: "Penyusunan palet, material, dan referensi visual untuk menyatukan visi." },
                  { step: "3", title: "Eksekusi & Delivery", desc: "Pengerjaan detail dengan standar kualitas tinggi sesuai timeline yang disepakati." },
                  { step: "4", title: "Revisi & Finalisasi", desc: "Penyesuaian berdasarkan feedback hingga Anda puas dengan hasilnya." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-[#d3e4fe] flex items-center justify-center font-bold text-[#003c90] shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-[#0b1c30] text-sm">{item.title}</h4>
                      <p className="text-[#434653] text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <div className="rounded-xl border border-[#c3c6d5] bg-white p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#003c90] text-xl">payments</span>
                  <div>
                    <p className="text-xs font-semibold text-[#0b1c30]">Harga Mulai</p>
                    <p className="text-sm font-bold text-[#0b1c30] mt-0.5">
                      {formatRupiah(service.priceFrom)}
                      <span className="text-xs font-normal text-[#737784] ml-1">/{service.unit}</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#c3c6d5] bg-white p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#003c90] text-xl">category</span>
                  <div>
                    <p className="text-xs font-semibold text-[#0b1c30]">Kategori</p>
                    <p className="text-sm text-[#434653] mt-0.5">{service.category?.name ?? "Layanan Profesional"}</p>
                  </div>
                </div>
                {service.rating > 0 && (
                  <div className="rounded-xl border border-[#c3c6d5] bg-white p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-yellow-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <div>
                      <p className="text-xs font-semibold text-[#0b1c30]">Rating</p>
                      <p className="text-sm font-bold text-[#003c90] mt-0.5">{service.rating.toFixed(1)} / 5.0</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "paket" && (
            <div className="py-4">
              {!packages || packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#c3c6d5] mb-3">payments</span>
                  <p className="text-[#737784] text-sm">Belum ada paket layanan yang tersedia.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-5 max-w-4xl">
                  {packages.map((pkg: { name: string; price?: number | null; recommended?: boolean; features: string[] }, i: number) => (
                    <div
                      key={i}
                      className={`p-6 rounded-xl shadow-sm space-y-4 relative ${
                        pkg.recommended
                          ? "bg-white border-2 border-[#003c90] shadow-md"
                          : "bg-white border border-[#c3c6d5]"
                      }`}
                    >
                      {pkg.recommended && (
                        <span className="absolute -top-3 right-4 px-2 py-1 bg-[#003c90] text-white text-[10px] font-bold uppercase rounded">
                          Recommended
                        </span>
                      )}
                      <h4 className="font-bold text-lg text-[#003c90]">{pkg.name}</h4>
                      {pkg.price && (
                        <p className="text-xl font-bold text-[#0b1c30]">{formatRupiah(pkg.price)}</p>
                      )}
                      <ul className="space-y-3 text-[#434653] text-sm">
                        {(pkg.features ?? []).map((f: string, j: number) => (
                          <li key={j} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#006a61] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full mt-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        pkg.recommended
                          ? "bg-[#003c90] text-white hover:bg-[#0f52ba]"
                          : "border border-[#c3c6d5] text-[#003c90] hover:bg-[#e5eeff]"
                      }`}>
                        Pilih Paket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "portofolio" && (
            <div className="py-4">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#c3c6d5] mb-3">photo_library</span>
                  <p className="text-[#737784] text-sm">Belum ada foto portofolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImg(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer"
                    >
                      <img src={img} alt={`portofolio-${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-semibold text-sm">Foto {i + 1}</span>
                        <span className="text-white/70 text-xs">{service.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <section className="mb-16">
          <div className="bg-white p-6 rounded-xl border border-[#c3c6d5] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#0b1c30]">Ulasan Pelanggan</h3>
                <div className="flex items-center gap-1 bg-[#e5eeff] px-2 py-1 rounded text-[#003c90] text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span>{service.rating > 0 ? service.rating.toFixed(1) : "0.0"} Rata-rata</span>
                </div>
              </div>
              <button className="border border-[#003c90] text-[#003c90] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#eff4ff] transition-colors">
                Tulis Ulasan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Sarah Jenkins",
                  rating: 5,
                  text: "Kualitas desain websitenya sangat tinggi. Tim menjaga komunikasi profesional sepanjang proses dan memberikan hasil yang tepat sesuai kebutuhan kami.",
                  avatar: "SJ",
                  time: "2 minggu lalu",
                },
                {
                  name: "Mark D.",
                  rating: 5,
                  text: "Saya sangat terkesan dengan eksekusi teknisnya. Kecepatan situs kami luar biasa dan kami sudah melihat peningkatan signifikan pada SEO sejak peluncuran.",
                  avatar: "MD",
                  time: "1 bulan lalu",
                },
              ].map((review, i) => (
                <div key={i} className="p-4 bg-[#eff4ff] rounded-lg flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#003c90] text-xs font-bold">
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0b1c30]">{review.name}</h4>
                      <div className="flex text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span key={j} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "14px" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-[#737784]">{review.time}</span>
                  </div>
                  <p className="text-sm text-[#434653] leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-[#003c90] text-xs font-semibold hover:underline">Lihat Semua Ulasan</button>
            </div>
          </div>
        </section>
      </main>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={service.name} />
    </div>
  );
}
