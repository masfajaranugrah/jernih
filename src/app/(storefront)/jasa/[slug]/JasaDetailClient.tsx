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
    if (rating >= i) stars.push(<span key={i} className="material-symbols-outlined text-sm text-[#003527]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>);
    else if (rating >= i - 0.5) stars.push(<span key={i} className="material-symbols-outlined text-sm text-[#003527]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>);
    else stars.push(<span key={i} className="material-symbols-outlined text-sm text-[#bfc9c3]">star</span>);
  }
  return <div className="flex">{stars}</div>;
}

type TabId = "deskripsi" | "paket" | "portofolio";

// Parse package tiers from description if encoded
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

export default function JasaDetailClient({ service }: { service: ApiService }) {
  const [activeTab, setActiveTab] = useState<TabId>("deskripsi");
  const [activeImg, setActiveImg] = useState(0);

  const images = service.images ?? [];
  const extraCount = Math.max(0, images.length - 4);
  const packages = parsePackages(service.description);
  const description = cleanDescription(service.description);

  const TABS: { id: TabId; label: string }[] = [
    { id: "deskripsi", label: "Deskripsi" },
    { id: "paket", label: "Paket Layanan" },
    { id: "portofolio", label: "Portofolio" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
        .active-tab { border-bottom: 2px solid #064e3b; color: #003527; }
      `}</style>

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 py-3">

        {/* Breadcrumb */}
        <nav className="flex py-6 text-[#707974] text-xs">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li><Link href="/" className="hover:text-[#003527] transition-colors">Home</Link></li>
            <li className="flex items-center">
              <span className="material-symbols-outlined text-base mx-1">chevron_right</span>
              <Link href="/jasa" className="hover:text-[#003527] transition-colors">Jasa</Link>
            </li>
            <li className="flex items-center">
              <span className="material-symbols-outlined text-base mx-1">chevron_right</span>
              <span className="text-[#191c1d] font-semibold line-clamp-1">{service.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-8">

          {/* ── Left: Gallery ── */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main image */}
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#edeeef] shadow-md">
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImg]}
                  alt={service.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl text-[#bfc9c3]">design_services</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                      activeImg === i ? "border-[#003527]" : "border-[#bfc9c3] hover:border-[#003527]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {images.length >= 4 && (
                  <button
                    onClick={() => setActiveImg(3)}
                    className={`aspect-square rounded-lg overflow-hidden relative border-2 transition-colors cursor-pointer ${
                      activeImg === 3 ? "border-[#003527]" : "border-[#bfc9c3] hover:border-[#003527]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[3]}
                      alt="thumb-3"
                      className={`w-full h-full object-cover ${extraCount > 0 ? "brightness-50" : ""}`}
                    />
                    {extraCount > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                        +{extraCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-5">
            {/* Badge + Title */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-[#b0f0d6] text-[#002117] font-semibold text-[11px] rounded-full tracking-wider uppercase">
                {service.category?.name ?? "Layanan Terpopuler"}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-[#003527] leading-tight">{service.name}</h1>
            </div>

            {/* Rating */}
            {service.rating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={service.rating} />
                <span className="text-[#707974] text-xs">({service.rating.toFixed(1)}/5 dari ulasan)</span>
              </div>
            )}

            {/* Description snippet */}
            {description && (
              <p className="whitespace-pre-line text-[#707974] text-sm leading-relaxed line-clamp-3">{description}</p>
            )}

            {/* Price */}
            <div className="py-4 border-y border-[#bfc9c3]">
              <span className="text-xs text-[#707974]">Mulai dari</span>
              <div className="text-2xl font-bold text-[#003527]">
                {formatRupiah(service.priceFrom)}
                <span className="text-sm font-normal text-[#707974] ml-1">/{service.unit}</span>
              </div>
            </div>

            {/* Room type selector (decorative for now) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">Jenis Layanan</label>
              <select className="w-full bg-[#f8f9fa] border border-[#bfc9c3] rounded-xl py-3 px-4 text-sm text-[#191c1d] outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] transition-all">
                <option>Konsultasi Awal</option>
                <option>Paket Lengkap</option>
                <option>On-Site Visit</option>
              </select>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-1">
              <button className="flex-1 bg-[#003527] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#064e3b] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                Konsultasi Sekarang
              </button>
              <button className="px-4 py-3 border border-[#bfc9c3] rounded-xl hover:bg-[#edeeef] transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[#003527]">favorite</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#bfc9c3]">
              {[
                { icon: "verified", label: "Jaminan Kualitas" },
                { icon: "workspace_premium", label: "Desainer Expert" },
                { icon: "support_agent", label: "Support 24/7" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-1">
                  <span className="material-symbols-outlined text-[#003527] text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-tighter text-[#707974]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Provider info */}
            {service.mitra && (
              <div className="flex items-center gap-3 pt-3 border-t border-[#bfc9c3]">
                <div className="w-9 h-9 rounded-full bg-[#064e3b] flex items-center justify-center flex-shrink-0">
                  {service.mitra.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={service.mitra.logo} alt="logo" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-white text-[11px] font-bold">{service.mitra.storeName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#707974]">Disediakan oleh</p>
                  <p className="text-sm font-semibold text-[#003527]">{service.mitra.storeName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-4 pb-16">
          <div className="flex border-b border-[#bfc9c3] mb-6 gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id ? "active-tab" : "text-[#707974] hover:text-[#003527]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Deskripsi */}
          {activeTab === "deskripsi" && (
            <div className="space-y-8 py-4 max-w-4xl">
              <div>
                <h3 className="text-xl font-bold text-[#003527] mb-4">Proses Layanan yang Terpersonalisasi</h3>
                {description ? (
                  <p className="whitespace-pre-line text-[#707974] text-sm leading-relaxed">{description}</p>
                ) : (
                  <p className="text-[#707974] italic text-sm">Belum ada deskripsi untuk jasa ini.</p>
                )}
              </div>

              {/* Process steps */}
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { step: "1", title: "Discovery & Briefing", desc: "Pertemuan awal untuk memahami kebutuhan, gaya, dan anggaran Anda secara mendalam." },
                  { step: "2", title: "Konsep & Moodboard", desc: "Penyusunan palet, material, dan referensi visual untuk menyatukan visi." },
                  { step: "3", title: "Eksekusi & Delivery", desc: "Pengerjaan detail dengan standar kualitas tinggi sesuai timeline yang disepakati." },
                  { step: "4", title: "Revisi & Finalisasi", desc: "Penyesuaian berdasarkan feedback hingga Anda puas dengan hasilnya." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-[#b0f0d6] flex items-center justify-center font-bold text-[#003527] shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-semibold text-[#191c1d] text-sm">{item.title}</h4>
                      <p className="text-[#707974] text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info highlights */}
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <div className="rounded-xl border border-[#e1e3e4] bg-white p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#064e3b] text-xl">payments</span>
                  <div>
                    <p className="text-xs font-semibold text-[#191c1d]">Harga Mulai</p>
                    <p className="text-sm font-bold text-[#003527] mt-0.5">
                      {formatRupiah(service.priceFrom)}
                      <span className="text-xs font-normal text-[#707974] ml-1">/{service.unit}</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#e1e3e4] bg-white p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#064e3b] text-xl">category</span>
                  <div>
                    <p className="text-xs font-semibold text-[#191c1d]">Kategori</p>
                    <p className="text-sm text-[#707974] mt-0.5">{service.category?.name ?? "Layanan Profesional"}</p>
                  </div>
                </div>
                {service.rating > 0 && (
                  <div className="rounded-xl border border-[#e1e3e4] bg-white p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#064e3b] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <div>
                      <p className="text-xs font-semibold text-[#191c1d]">Rating</p>
                      <p className="text-sm font-bold text-[#003527] mt-0.5">{service.rating.toFixed(1)} / 5.0</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Paket Layanan */}
          {activeTab === "paket" && (
            <div className="py-4">
              {!packages || packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-3">payments</span>
                  <p className="text-[#707974] text-sm">Belum ada paket layanan yang tersedia.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-5 max-w-4xl">
                  {packages.map((pkg: { name: string; price?: number | null; recommended?: boolean; features: string[] }, i: number) => (
                    <div
                      key={i}
                      className={`p-6 rounded-xl shadow-sm space-y-4 relative ${
                        pkg.recommended
                          ? "bg-white border-2 border-[#003527] shadow-md"
                          : "bg-white border border-[#bfc9c3]"
                      }`}
                    >
                      {pkg.recommended && (
                        <span className="absolute -top-3 right-4 px-2 py-1 bg-[#003527] text-white text-[10px] font-bold uppercase rounded">
                          Recommended
                        </span>
                      )}
                      <h4 className="font-bold text-lg text-[#003527]">{pkg.name}</h4>
                      {pkg.price && (
                        <p className="text-xl font-bold text-[#003527]">{formatRupiah(pkg.price)}</p>
                      )}
                      <ul className="space-y-3 text-[#707974] text-sm">
                        {(pkg.features ?? []).map((f: string, j: number) => (
                          <li key={j} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#003527] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full mt-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        pkg.recommended
                          ? "bg-[#003527] text-white hover:bg-[#064e3b]"
                          : "border border-[#bfc9c3] text-[#003527] hover:bg-[#f3f4f5]"
                      }`}>
                        Pilih Paket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Portofolio */}
          {activeTab === "portofolio" && (
            <div className="py-4">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-3">photo_library</span>
                  <p className="text-[#707974] text-sm">Belum ada foto portofolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImg(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`portofolio-${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
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

        {/* Trust section */}
        <section className="py-12 border-t border-[#bfc9c3] mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "security", title: "Keamanan Terjamin", desc: "Transaksi aman dan proteksi untuk setiap proyek pengerjaan." },
              { icon: "groups", title: "Expert Community", desc: "Akses ke jaringan pengrajin dan supplier material premium pilihan." },
              { icon: "schedule", title: "Tepat Waktu", desc: "Timeline yang transparan dan komitmen jadwal yang ketat." },
            ].map((item) => (
              <div key={item.title} className="flex gap-5 items-start">
                <div className="w-12 h-12 bg-[#b0f0d6] rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#003527]">{item.icon}</span>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-[#191c1d]">{item.title}</h5>
                  <p className="text-[#707974] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#e7e8e9] w-full py-16 border-t border-[#bfc9c3]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="space-y-4 max-w-sm">
            <h2 className="text-[#003527] font-bold text-2xl">Jernih Creatife</h2>
            <p className="text-[#707974] text-base">Platform jasa profesional terpercaya untuk kebutuhan Anda.</p>
          </div>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-[#191c1d]">Bantuan</h4>
              <ul className="space-y-2 text-[#707974]">
                {["Hubungi Kami", "Syarat & Ketentuan", "Pusat Bantuan"].map((item) => (
                  <li key={item}><a href="#" className="text-sm hover:text-[#003527] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-[#191c1d]">Legal</h4>
              <ul className="space-y-2 text-[#707974]">
                {["Kebijakan Privasi", "Syarat & Ketentuan"].map((item) => (
                  <li key={item}><a href="#" className="text-sm hover:text-[#003527] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-10 pt-5 border-t border-[#bfc9c3]">
          <p className="text-xs text-[#707974]">© 2024 Jernih Creatife. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
