"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveHeroMain, saveHeroBanner, resetHero } from "@/lib/hero-actions";
import type { HeroData } from "@/lib/hero-store";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";

type Props = { initial: HeroData };

function Field({
  label, name, value, onChange, textarea = false,
}: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#707974] uppercase tracking-wider">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20 outline-none transition-all resize-none"
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20 outline-none transition-all"
        />
      )}
    </div>
  );
}

export default function HeroEditor({ initial }: Props) {
  const [main, setMain] = useState(initial.main);
  const [banners, setBanners] = useState(initial.banners);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const setMainField = (key: keyof typeof main) => (v: string) =>
    setMain((prev) => ({ ...prev, [key]: v }));

  const setBannerField = (i: 0 | 1 | 2, key: string) => (v: string) =>
    setBanners((prev) => {
      const next = [...prev] as typeof prev;
      next[i] = { ...next[i], [key]: v };
      return next;
    });

  const handleSave = () => {
    startTransition(async () => {
      const { getToken } = await import("@/lib/auth");
      const token = getToken();
      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }
      await saveHeroMain(main, token);
      await saveHeroBanner(0, banners[0], token);
      await saveHeroBanner(1, banners[1], token);
      await saveHeroBanner(2, banners[2], token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const { getToken } = await import("@/lib/auth");
      const token = getToken() ?? "";
      await resetHero(token);
      window.location.reload();
    });
  };

  const bannerLabels = ["Banner Kanan Atas", "Banner Kiri Bawah", "Banner Kanan Bawah"];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-[#e1e3e4] px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard-admin/orders" className="text-[#707974] hover:text-[#003527] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="material-symbols-outlined text-[#003527]">image</span>
          <h1 className="text-[#003527] font-bold text-xl">Edit Hero Banner</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank"
            className="flex items-center gap-1.5 text-sm text-[#707974] hover:text-[#003527] transition-colors">
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Preview
          </Link>
          <button onClick={handleReset} disabled={isPending}
            className="px-4 py-2 border border-[#bfc9c3] text-[#707974] font-semibold text-sm rounded-lg hover:bg-[#f3f4f5] transition-colors disabled:opacity-50">
            Reset Default
          </button>
          <button onClick={handleSave} disabled={isPending}
            className={`px-5 py-2 font-semibold text-sm rounded-lg transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-[#003527] text-white hover:bg-[#064e3b]"
            } disabled:opacity-50`}>
            {isPending ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Preview hint */}
        <div className="bg-[#064e3b]/5 border border-[#064e3b]/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#064e3b]">info</span>
          <p className="text-sm text-[#064e3b]">
            Perubahan akan langsung terlihat di halaman utama setelah klik{" "}
            <strong>Simpan Perubahan</strong>. Klik <strong>Preview</strong> untuk melihat hasilnya.
          </p>
        </div>

        {/* Hero utama */}
        <section className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e1e3e4] bg-[#f3f4f5] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#003527] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">smartphone</span>
            </div>
            <h2 className="font-semibold text-base text-[#191c1d]">Hero Utama (Kiri Besar)</h2>
          </div>

          {/* Preview mini */}
          <div className="px-6 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#707974]">Preview</p>
            <div className="relative rounded-xl overflow-hidden h-40 mb-5"
              style={{ backgroundColor: main.bgColor }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={main.imageUrl} alt={main.imageAlt}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              <div className="relative z-10 p-4 flex flex-col justify-center h-full">
                <span className="w-fit bg-[#064e3b]/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-2">
                  {main.badge || "BADGE"}
                </span>
                <p className="text-base font-black text-white leading-tight">
                  {main.title || "Judul"}
                  {main.titleSuffix && <span className="font-light italic"> {main.titleSuffix}</span>}
                </p>
                <p className="text-[10px] text-white/70 mt-1 line-clamp-1">{main.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="bg-white text-[#064e3b] text-[9px] font-bold px-2 py-1 rounded-lg">{main.ctaText || "CTA"}</span>
                  <span className="border border-white/40 text-white text-[9px] font-bold px-2 py-1 rounded-lg">Lihat Semua</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Badge" name="badge" value={main.badge} onChange={setMainField("badge")} />
            <Field label="Warna Background" name="bgColor" value={main.bgColor} onChange={setMainField("bgColor")} />
            <Field label="Judul" name="title" value={main.title} onChange={setMainField("title")} />
            <Field label="Suffix Judul (cth: 5G)" name="titleSuffix" value={main.titleSuffix} onChange={setMainField("titleSuffix")} />
            <div className="sm:col-span-2">
              <Field label="Deskripsi" name="description" value={main.description} onChange={setMainField("description")} textarea />
            </div>
            <Field label="Teks CTA (cth: Coming Soon)" name="ctaText" value={main.ctaText} onChange={setMainField("ctaText")} />
            <Field label="URL Gambar" name="imageUrl" value={main.imageUrl} onChange={setMainField("imageUrl")} />
            <Field label="Alt Text Gambar" name="imageAlt" value={main.imageAlt} onChange={setMainField("imageAlt")} />
            <Field label="Link Tujuan" name="linkHref" value={main.linkHref} onChange={setMainField("linkHref")} />
          </div>
        </section>

        {/* 3 banner */}
        {([0, 1, 2] as const).map((i) => (
          <section key={i} className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e1e3e4] bg-[#f3f4f5] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: banners[i].bgColor + "33" }}>
                <span className="material-symbols-outlined text-base" style={{ color: banners[i].bgColor }}>
                  image
                </span>
              </div>
              <h2 className="font-semibold text-base text-[#191c1d]">{bannerLabels[i]}</h2>
            </div>

            {/* Preview mini */}
            <div className="px-6 pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#707974]">Preview</p>
              <div className="relative rounded-xl overflow-hidden mb-5"
                style={{ backgroundColor: banners[i].bgColor, height: i === 0 ? "120px" : "100px" }}>
                {/* Gambar background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banners[i].imageUrl} alt={banners[i].title}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    i === 0 ? "opacity-40" : i === 1 ? "opacity-60" : "opacity-50"
                  }`} />

                {/* Dekorasi blur untuk banner 2 (b2) */}
                {i === 2 && (
                  <>
                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#064e3b]/20 blur-2xl" />
                    <div className="absolute -bottom-3 -left-3 h-14 w-14 rounded-full bg-[#064e3b]/20 blur-xl" />
                  </>
                )}

                {/* Konten */}
                <div className={`absolute inset-0 flex flex-col p-3 z-10 text-white ${
                  i === 0
                    ? "justify-between"
                    : i === 1
                    ? "justify-end"
                    : "items-center justify-center text-center"
                }`}>
                  {/* Banner 0: judul + badge atas, link bawah */}
                  {i === 0 && (
                    <>
                      <div className="flex items-start justify-between w-full">
                        <p className="text-sm font-black leading-tight">
                          {banners[0].subtitle && <span className="block">{banners[0].subtitle}</span>}
                          {banners[0].title}
                        </p>
                        <span className="bg-yellow-400 text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded ml-2 shrink-0">
                          Featured
                        </span>
                      </div>
                      <div>
                        {banners[0].tagline && <p className="text-[9px] text-white/70 mb-1">{banners[0].tagline}</p>}
                        <span className="text-xs font-bold border-b border-[#064e3b]">
                          {banners[0].ctaText || "Pelajari Lebih"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Banner 1: teks bawah + tombol */}
                  {i === 1 && (
                    <>
                      <p className="text-sm font-black leading-tight">{banners[1].title}</p>
                      {banners[1].subtitle && <p className="text-[9px] text-white/70 mt-0.5">{banners[1].subtitle}</p>}
                      {banners[1].ctaText && (
                        <span className={`mt-2 w-full text-center py-1 text-[9px] font-bold rounded-md block ${banners[1].ctaColor} ${banners[1].ctaTextColor}`}>
                          {banners[1].ctaText}
                        </span>
                      )}
                    </>
                  )}

                  {/* Banner 2: center dengan tagline + judul X + CTA */}
                  {i === 2 && (
                    <>
                      {banners[2].tagline && (
                        <span className="mb-1 rounded-full bg-[#064e3b]/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#4ade80]">
                          {banners[2].tagline}
                        </span>
                      )}
                      <p className="text-base font-black italic tracking-tight">
                        {banners[2].title.includes("X") ? (
                          <>{banners[2].title.split("X")[0]}<span className="text-[#4ade80]">X</span>{banners[2].title.split("X")[1]}</>
                        ) : banners[2].title}
                      </p>
                      {banners[2].subtitle && <p className="text-[9px] text-white/60 mt-0.5">{banners[2].subtitle}</p>}
                      {banners[2].ctaText && (
                        <span className={`mt-2 px-3 py-1 text-[9px] font-bold rounded-md ${banners[2].ctaColor} ${banners[2].ctaTextColor}`}>
                          {banners[2].ctaText}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Warna Background" name="bgColor" value={banners[i].bgColor} onChange={setBannerField(i, "bgColor")} />
              <Field label="Label / Nama Banner" name="label" value={banners[i].label ?? ""} onChange={setBannerField(i, "label")} />
              <Field label="Judul Utama" name="title" value={banners[i].title} onChange={setBannerField(i, "title")} />
              {i === 0 && (
                <Field label="Subtitle (baris atas judul)" name="subtitle" value={banners[i].subtitle ?? ""} onChange={setBannerField(i, "subtitle")} />
              )}
              {i !== 0 && (
                <Field label="Subtitle" name="subtitle" value={banners[i].subtitle ?? ""} onChange={setBannerField(i, "subtitle")} />
              )}
              <Field label="Tagline Kecil" name="tagline" value={banners[i].tagline ?? ""} onChange={setBannerField(i, "tagline")} />
              <Field label="Teks Tombol CTA" name="ctaText" value={banners[i].ctaText} onChange={setBannerField(i, "ctaText")} />
              <div className="sm:col-span-2">
                <Field label="URL Gambar" name="imageUrl" value={banners[i].imageUrl} onChange={setBannerField(i, "imageUrl")} />
              </div>
              {/* Keterangan layout per banner */}
              <div className="sm:col-span-2 rounded-lg bg-[#064e3b]/5 border border-[#064e3b]/15 p-3">
                <p className="text-xs text-[#064e3b] font-medium">
                  {i === 0 && "ℹ️ Banner Kanan Atas: gambar ditampilkan sebagai background (opacity 40%). Judul & subtitle di kiri atas, tagline & CTA di kiri bawah."}
                  {i === 1 && "ℹ️ Banner Kiri Bawah: gambar sebagai background (opacity 60%) + gradient gelap di bawah. Konten teks di bagian bawah tile."}
                  {i === 2 && "ℹ️ Banner Kanan Bawah: jika URL gambar diisi, gambar tampil sebagai background. Konten teks di tengah tile dengan aksen blur."}
                </p>
              </div>
            </div>
          </section>
        ))}

        {/* Save button bottom */}
        <div className="flex justify-end gap-3 pb-6">
          <button onClick={handleReset} disabled={isPending}
            className="px-5 py-3 border border-[#bfc9c3] text-[#707974] font-semibold text-sm rounded-lg hover:bg-[#f3f4f5] transition-colors disabled:opacity-50">
            Reset Default
          </button>
          <button onClick={handleSave} disabled={isPending}
            className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all ${
              saved ? "bg-green-600 text-white" : "bg-[#003527] text-white hover:bg-[#064e3b]"
            } disabled:opacity-50`}>
            {isPending ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
          </button>
        </div>
      </main>
      </div>
    </div>
  );
}
