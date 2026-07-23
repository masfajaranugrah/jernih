"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApiRentalItem } from "@/lib/rental-actions";

function formatRupiah(val: string | number) {
  return "Rp " + parseFloat(String(val)).toLocaleString("id-ID");
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
              <div className={`w-12 h-12 ${s.color} rounded-full flex items-center justify-center text-white shadow-md`}>
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

export default function SewaDetailClient({ item }: { item: ApiRentalItem }) {
  const [activeImg, setActiveImg] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const images = item.images ?? [];
  const extraCount = Math.max(0, images.length - 4);
  const cleanDesc = item.description?.replace(/^\[cat:[^\]]+\]\s*/, "");

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0;24,400,1,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-[#737784] mb-6">
          <ol className="inline-flex items-center gap-1 md:gap-2">
            <li><Link href="/" className="hover:text-[#003c90] transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-sm mx-1">chevron_right</span></li>
            <li><Link href="/sewa" className="hover:text-[#003c90] transition-colors">Sewa</Link></li>
            <li><span className="material-symbols-outlined text-sm mx-1">chevron_right</span></li>
            <li className="text-[#0b1c30] font-medium line-clamp-1">{item.name}</li>
          </ol>
        </nav>

        {/* Product Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#e5eeff] shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl text-[#737784]">inventory_2</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden transition-all cursor-pointer ${
                      activeImg === i
                        ? "border-2 border-[#003c90] bg-[#e5eeff] shadow-sm"
                        : "border border-[#c3c6d5] bg-[#e5eeff] shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] hover:scale-105"
                    }`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  onClick={() => images.length >= 4 && setActiveImg(3)}
                  className={`aspect-square rounded-lg overflow-hidden relative border border-[#c3c6d5] bg-[#eff4ff] shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex items-center justify-center text-[#737784] group`}
                >
                  {images.length >= 4 ? (
                    <>
                      <img src={images[3]} alt="thumb-3" className="w-full h-full object-cover brightness-50" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white group-hover:text-[#003c90] transition-colors">
                        <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
                        <span className="text-xs font-semibold">+{extraCount} Lagi</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="material-symbols-outlined block text-2xl mb-1">add_photo_alternate</span>
                      <span className="text-xs font-semibold">+{images.length} Lagi</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#c3c6d5] flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-xl md:text-2xl font-bold text-[#0b1c30]">{item.name}</h1>
                  <div className="flex items-center gap-1 bg-[#e5eeff] px-2 py-1 rounded text-[#003c90] text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>{item.rating.toFixed(1)} ({Math.floor(item.rating * 27)})</span>
                  </div>
                </div>
                {cleanDesc && (
                  <p className="text-sm text-[#434653] leading-relaxed">{cleanDesc}</p>
                )}
              </div>

              <div className="border-t border-b border-[#c3c6d5] py-4 flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold text-[#0b1c30]">{formatRupiah(item.pricePerDay)}</span>
                    <span className="text-sm text-[#737784]">/hari</span>
                  </div>
                  <span className="text-xs font-semibold text-[#006a61] bg-[#86f2e4] px-3 py-1 rounded-full">Tersedia</span>
                </div>

                {/* Date picker mockup */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#434653]">Tanggal Sewa</label>
                  <div className="flex items-center border border-[#c3c6d5] rounded-lg p-3 bg-[#f8f9ff] focus-within:border-[#003c90] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
                    <span className="material-symbols-outlined text-[#737784] mr-2">calendar_month</span>
                    <input
                      className="w-full bg-transparent border-none text-sm outline-none placeholder-[#c3c6d5]"
                      placeholder="Pilih tanggal mulai"
                      type="text"
                      readOnly
                      value="24 Okt 2024"
                    />
                    <span className="material-symbols-outlined text-[#737784] mx-2">arrow_forward</span>
                    <input
                      className="w-full bg-transparent border-none text-sm outline-none placeholder-[#c3c6d5] text-right"
                      placeholder="Pilih tanggal selesai"
                      type="text"
                      readOnly
                      value="27 Okt 2024"
                    />
                  </div>
                </div>

                {/* Duration summary */}
                <div className="flex justify-between items-center text-sm bg-[#e5eeff] p-3 rounded-lg">
                  <span className="text-[#434653]">Durasi (3 hari)</span>
                  <span className="font-semibold text-[#0b1c30]">{formatRupiah(Number(item.pricePerDay) * 3)}</span>
                </div>

                {/* Insurance toggle */}
                <div className="flex justify-between items-center p-3 border border-[#c3c6d5] rounded-lg bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#003c90]">shield</span>
                    <div>
                      <p className="text-xs font-semibold text-[#0b1c30]">Perlindungan Barang</p>
                      <p className="text-[10px] text-[#737784]">Melindungi dari kerusakan tak terduga</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#434653]">+Rp15.000/hari</span>
                    <div className="w-10 h-6 bg-[#003c90] rounded-full relative shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#0b1c30]">Total</span>
                  <span className="text-[#003c90]">{formatRupiah(Number(item.pricePerDay) * 3)}</span>
                </div>
                <a
                  href={`https://wa.me/${PHONE_NUMBER}?text=Halo%20saya%20tertarik%20sewa%20${encodeURIComponent(item.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-[#003c90] text-white font-semibold text-sm py-4 rounded-lg hover:bg-[#0f52ba] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] active:scale-[0.98]"
                >
                  <span>Sewa Sekarang</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
                <button
                  onClick={() => setShareOpen(true)}
                  className="flex w-full items-center justify-center gap-2 border border-[#003c90] text-[#003c90] font-semibold text-sm py-4 rounded-lg hover:bg-[#d9e2ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  Bagikan
                </button>
                <p className="text-center text-xs text-[#737784]">Pembayaran akan dikonfirmasi setelah ketersediaan dicek.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Below fold: Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Specs */}
          <div className="bg-white p-6 rounded-xl border border-[#c3c6d5] shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#003c90]">tune</span>
              <h3 className="font-bold text-[#0b1c30]">Spesifikasi</h3>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex justify-between border-b border-[#c3c6d5] pb-2">
                <span className="text-sm text-[#434653]">Deposit</span>
                <span className="text-sm font-medium text-[#0b1c30]">
                  {item.deposit && Number(item.deposit) > 0 ? formatRupiah(item.deposit) : "Tidak ada"}
                </span>
              </li>
              <li className="flex justify-between border-b border-[#c3c6d5] pb-2">
                <span className="text-sm text-[#434653]">Rating</span>
                <span className="text-sm font-medium text-[#0b1c30]">{item.rating.toFixed(1)} / 5.0</span>
              </li>
              <li className="flex justify-between">
                <span className="text-sm text-[#434653]">Status</span>
                <span className="text-sm font-medium text-[#006a61]">{item.isActive ? "Aktif" : "Tidak Aktif"}</span>
              </li>
            </ul>
          </div>

          {/* What's Included */}
          <div className="bg-white p-6 rounded-xl border border-[#c3c6d5] shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#003c90]">inventory_2</span>
              <h3 className="font-bold text-[#0b1c30]">Termasuk</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-[#eff4ff] rounded-lg text-center">
                <span className="material-symbols-outlined text-[#737784] text-3xl mb-2">photo_camera</span>
                <span className="text-xs font-semibold text-[#434653]">Unit Utama</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-[#eff4ff] rounded-lg text-center">
                <span className="material-symbols-outlined text-[#737784] text-3xl mb-2">battery_charging_full</span>
                <span className="text-xs font-semibold text-[#434653]">3x Baterai</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-[#eff4ff] rounded-lg text-center">
                <span className="material-symbols-outlined text-[#737784] text-3xl mb-2">sd_card</span>
                <span className="text-xs font-semibold text-[#434653]">2x 128GB Kartu</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-[#eff4ff] rounded-lg text-center">
                <span className="material-symbols-outlined text-[#737784] text-3xl mb-2">backpack</span>
                <span className="text-xs font-semibold text-[#434653]">Pelican Case</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-white p-6 rounded-xl border border-[#c3c6d5] shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#003c90]">description</span>
              <h3 className="font-bold text-[#0b1c30]">Ketentuan Sewa</h3>
            </div>
            <div className="flex flex-col gap-3 text-sm text-[#434653]">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#737784] text-lg shrink-0">check_circle</span>
                <p>Pengambilan setelah pukul 14:00. Pengembalian sebelum pukul 12:00.</p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#737784] text-lg shrink-0">info</span>
                <p>KTP dan kartu kredit diperlukan saat pengambilan.</p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[#737784] text-lg shrink-0">cancel</span>
                <p>Pembatalan gratis hingga 48 jam sebelum periode sewa dimulai.</p>
              </div>
            </div>
            <button className="mt-auto text-[#003c90] text-xs font-semibold self-start hover:underline flex items-center gap-1">
              Baca Ketentuan Lengkap <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl border border-[#c3c6d5] shadow-[0_2px_4px_rgba(0,0,0,0.04)] mt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-[#0b1c30]">Ulasan Pelanggan</h3>
              <div className="flex items-center gap-1 bg-[#e5eeff] px-2 py-1 rounded text-[#003c90] text-xs font-semibold">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span>{item.rating.toFixed(1)} Rata-rata</span>
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
                text: "Kondisi kamera sangat baik. Autofocus tracking-nya luar biasa untuk wedding videography. Daya tahan baterai solid, mudah digunakan setengah hari dengan satu baterai.",
                avatar: "SJ",
                time: "2 minggu lalu",
              },
              {
                name: "Mark D.",
                rating: 5,
                text: "Pelayanan bagus seperti biasa. Sensor A7IV jauh lebih baik dari III. Menu sudah touch-friendly. Rating dikurangi setengah karena strap yang disediakan agak aus, tapi gear-nya sempurna.",
                avatar: "MD",
                time: "1 bulan lalu",
              },
            ].map((review, i) => (
              <div key={i} className="p-4 bg-[#eff4ff] rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d3e4fe] overflow-hidden flex items-center justify-center text-[#003c90] text-xs font-bold">
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
      </main>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={item.name} />
    </div>
  );
}
