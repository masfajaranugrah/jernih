"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full bg-[#f8f9fa] border border-[#707974] px-3 py-2.5 sm:py-3 rounded focus:border-[#191c1d] focus:ring-1 focus:ring-[#191c1d] outline-none transition-colors text-[#191c1d] text-sm sm:text-base";
const inputStyle = { borderRadius: "0.25rem" };
const labelStyle: React.CSSProperties = { fontSize: "13px", lineHeight: 1, letterSpacing: "0.04em", fontWeight: 600 };

const steps = [
  { label: "Informasi Dasar" },
  { label: "Alamat & Lokasi" },
  { label: "Verifikasi Identitas" },
];

// ── Step 1 ──────────────────────────────────────────────────────────────────
function Step1() {
  return (
    <section>
      <h2
        className="text-[#191c1d] mb-10 border-b border-[#e7e8e9] pb-3"
        style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: 500 }}
      >
        Informasi Dasar
      </h2>
      <div className="space-y-6">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-[#191c1d]" style={labelStyle} htmlFor="fullName">
            Nama Lengkap (Sesuai KTP)
          </label>
          <input className={inputClass} style={inputStyle} id="fullName" placeholder="Masukkan nama lengkap" type="text" autoComplete="name" />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-[#191c1d]" style={labelStyle} htmlFor="email">Email Aktif</label>
            <input className={inputClass} style={inputStyle} id="email" placeholder="contoh@email.com" type="email" autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#191c1d]" style={labelStyle} htmlFor="phone">Nomor Telepon / WhatsApp</label>
            <input className={inputClass} style={inputStyle} id="phone" placeholder="081234567890" type="tel" autoComplete="tel" />
          </div>
        </div>

        {/* Business Name */}
        <div className="flex flex-col gap-1 pt-6 border-t border-[#f3f4f5]">
          <label className="text-[#191c1d] flex justify-between" style={labelStyle} htmlFor="businessName">
            <span>Nama Usaha / Toko</span>
            <span className="text-[#404944] font-normal">Opsional</span>
          </label>
          <input className={inputClass} style={inputStyle} id="businessName" placeholder="Nama toko Anda" type="text" />
          <p className="text-[#404944] mt-1" style={{ fontSize: "12px", lineHeight: 1, fontWeight: 500 }}>
            Kosongkan jika Anda mendaftar sebagai individu.
          </p>
        </div>

        {/* Business Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[#191c1d]" style={labelStyle} htmlFor="businessType">Kategori Usaha</label>
          <select
            className="w-full bg-[#f8f9fa] border border-[#707974] px-3 py-3 rounded focus:border-[#191c1d] focus:ring-1 focus:ring-[#191c1d] outline-none transition-colors appearance-none text-[#191c1d]"
            style={inputStyle}
            id="businessType"
            defaultValue=""
          >
            <option disabled value="">Pilih kategori usaha</option>
            <option value="retail">Retail / Barang Konsumsi</option>
            <option value="fnb">Makanan &amp; Minuman</option>
            <option value="services">Jasa</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
      </div>
    </section>
  );
}

// ── Step 2 ──────────────────────────────────────────────────────────────────
function Step2() {
  return (
    <section>
      <h2
        className="text-[#191c1d] mb-10 border-b border-[#e7e8e9] pb-3"
        style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: 500 }}
      >
        Alamat &amp; Lokasi
      </h2>
      <div className="space-y-6">
        {/* Street Address */}
        <div className="flex flex-col gap-1">
          <label className="text-[#191c1d]" style={labelStyle} htmlFor="address">Alamat Lengkap</label>
          <textarea
            className="w-full bg-[#f8f9fa] border border-[#707974] px-3 py-3 rounded focus:border-[#191c1d] focus:ring-1 focus:ring-[#191c1d] outline-none transition-colors text-[#191c1d] resize-none"
            style={{ ...inputStyle, borderRadius: "0.25rem" }}
            id="address"
            placeholder="Jl. Contoh No. 123, RT/RW 01/02"
            rows={3}
          />
        </div>

        {/* Province & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-[#191c1d]" style={labelStyle} htmlFor="province">Provinsi</label>
            <select
              className="w-full bg-[#f8f9fa] border border-[#707974] px-3 py-3 rounded focus:border-[#191c1d] focus:ring-1 focus:ring-[#191c1d] outline-none transition-colors appearance-none text-[#191c1d]"
              style={inputStyle}
              id="province"
              defaultValue=""
            >
              <option disabled value="">Pilih provinsi</option>
              <option value="jatim">Jawa Timur</option>
              <option value="jabar">Jawa Barat</option>
              <option value="jateng">Jawa Tengah</option>
              <option value="dki">DKI Jakarta</option>
              <option value="bali">Bali</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#191c1d]" style={labelStyle} htmlFor="city">Kota / Kabupaten</label>
            <input className={inputClass} style={inputStyle} id="city" placeholder="Nama kota / kabupaten" type="text" />
          </div>
        </div>

        {/* District & Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-[#191c1d]" style={labelStyle} htmlFor="district">Kecamatan</label>
            <input className={inputClass} style={inputStyle} id="district" placeholder="Nama kecamatan" type="text" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#191c1d]" style={labelStyle} htmlFor="postalCode">Kode Pos</label>
            <input className={inputClass} style={inputStyle} id="postalCode" placeholder="12345" type="text" maxLength={5} />
          </div>
        </div>

        {/* Google Maps Link */}
        <div className="flex flex-col gap-1 pt-6 border-t border-[#f3f4f5]">
          <label className="text-[#191c1d] flex justify-between" style={labelStyle} htmlFor="mapsLink">
            <span>Link Google Maps</span>
            <span className="text-[#404944] font-normal">Opsional</span>
          </label>
          <input
            className={inputClass}
            style={inputStyle}
            id="mapsLink"
            placeholder="https://maps.app.goo.gl/..."
            type="url"
          />
          <p className="text-[#404944] mt-1" style={{ fontSize: "12px", lineHeight: 1, fontWeight: 500 }}>
            Memudahkan pelanggan menemukan lokasi usaha Anda.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Step 3 ──────────────────────────────────────────────────────────────────
function Step3() {
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  return (
    <section>
      <h2
        className="text-[#191c1d] mb-10 border-b border-[#e7e8e9] pb-3"
        style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: 500 }}
      >
        Verifikasi Identitas
      </h2>
      <div className="space-y-6">
        {/* Info banner */}
        <div className="rounded-lg bg-[#b0f0d6]/30 border border-[#064e3b]/20 px-4 py-3 flex gap-3 items-start">
          <svg className="w-5 h-5 text-[#003527] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="text-[#003527]" style={{ fontSize: "14px", lineHeight: "1.6", fontWeight: 400 }}>
            Data identitas Anda hanya digunakan untuk keperluan verifikasi mitra dan dijaga kerahasiaannya sesuai kebijakan privasi Jernih Creatife.
          </p>
        </div>

        {/* NIK */}
        <div className="flex flex-col gap-1">
          <label className="text-[#191c1d]" style={labelStyle} htmlFor="nik">Nomor Induk Kependudukan (NIK)</label>
          <input
            className={inputClass}
            style={inputStyle}
            id="nik"
            placeholder="16 digit nomor KTP"
            type="text"
            maxLength={16}
          />
        </div>

        {/* KTP Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-[#191c1d]" style={labelStyle}>Foto KTP</label>
          <p className="text-[#404944]" style={{ fontSize: "12px", lineHeight: "1.5", fontWeight: 500 }}>
            Upload foto KTP yang jelas, tidak buram, dan seluruh bagian terbaca. Format: JPG, PNG. Maks. 5 MB.
          </p>
          <label
            htmlFor="ktpUpload"
            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#bfc9c3] rounded-lg cursor-pointer hover:border-[#003527] hover:bg-[#f3f4f5] transition-colors overflow-hidden"
          >
            {ktpPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ktpPreview} alt="Preview KTP" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#404944]">
                <svg className="w-10 h-10 text-[#bfc9c3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Klik untuk upload foto KTP</span>
                <span style={{ fontSize: "12px", fontWeight: 400 }}>atau seret & lepas di sini</span>
              </div>
            )}
            <input
              id="ktpUpload"
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => handleFile(e, setKtpPreview)}
            />
          </label>
          {ktpPreview && (
            <button
              type="button"
              onClick={() => setKtpPreview(null)}
              className="self-start text-[#ba1a1a] hover:underline"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Hapus foto
            </button>
          )}
        </div>

        {/* Selfie with KTP Upload */}
        <div className="flex flex-col gap-2 pt-6 border-t border-[#f3f4f5]">
          <label className="text-[#191c1d]" style={labelStyle}>Foto Selfie Memegang KTP</label>
          <p className="text-[#404944]" style={{ fontSize: "12px", lineHeight: "1.5", fontWeight: 500 }}>
            Foto wajah Anda sambil memegang KTP. Pastikan wajah dan tulisan KTP terlihat jelas. Format: JPG, PNG. Maks. 5 MB.
          </p>
          <label
            htmlFor="selfieUpload"
            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#bfc9c3] rounded-lg cursor-pointer hover:border-[#003527] hover:bg-[#f3f4f5] transition-colors overflow-hidden"
          >
            {selfiePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selfiePreview} alt="Preview selfie KTP" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#404944]">
                <svg className="w-10 h-10 text-[#bfc9c3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Klik untuk upload foto selfie + KTP</span>
                <span style={{ fontSize: "12px", fontWeight: 400 }}>atau seret &amp; lepas di sini</span>
              </div>
            )}
            <input
              id="selfieUpload"
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => handleFile(e, setSelfiePreview)}
            />
          </label>
          {selfiePreview && (
            <button
              type="button"
              onClick={() => setSelfiePreview(null)}
              className="self-start text-[#ba1a1a] hover:underline"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Hapus foto
            </button>
          )}
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-3 pt-4">
          <input
            type="checkbox"
            id="agree"
            className="mt-1 h-4 w-4 rounded border-[#bfc9c3] accent-[#003527] shrink-0"
          />
          <label htmlFor="agree" className="text-[#404944]" style={{ fontSize: "14px", lineHeight: "1.6", fontWeight: 400 }}>
            Saya menyatakan bahwa data yang saya masukkan adalah benar dan sesuai dengan identitas asli saya. Saya menyetujui{" "}
            <a href="#" className="text-[#003527] font-semibold hover:underline">Syarat & Ketentuan</a>{" "}
            serta{" "}
            <a href="#" className="text-[#003527] font-semibold hover:underline">Kebijakan Privasi</a>{" "}
            Jernih Creatife.
          </label>
        </div>
      </div>
    </section>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function RegisterMitraForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const handleSubmit = () => router.push("/register-mitra/success");

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#191c1d] antialiased">

      {/* ── Mobile / Tablet header (hidden on lg) ── */}
      <div className="lg:hidden bg-white border-b border-[#e1e3e4] px-4 sm:px-6 py-4">
        <Link href="/" className="block text-[#003527] font-bold text-2xl mb-1">
          Jernih Creatife
        </Link>
        <p className="text-[#191c1d] font-semibold text-base">Pendaftaran Mitra</p>

        {/* Step bar — mobile horizontal */}
        <div className="mt-4 flex items-center gap-0">
          {steps.map((step, idx) => {
            const num = idx + 1;
            const isActive = currentStep === num;
            const isDone = currentStep > num;
            return (
              <div key={num} className="flex items-center flex-1">
                {/* Step circle + label */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive ? "bg-[#003527] text-white"
                      : isDone ? "bg-[#064e3b] text-white"
                      : "bg-[#e1e3e4] text-[#707974]"
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : num}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight max-w-[64px] ${isActive ? "text-[#003527]" : isDone ? "text-[#064e3b]" : "text-[#9ca3af]"}`}>
                    {step.label}
                  </span>
                </div>
                {/* Connector line between steps */}
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${isDone ? "bg-[#064e3b]" : "bg-[#e1e3e4]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-16 flex flex-col lg:flex-row gap-6 lg:gap-16">

        {/* ── Desktop sidebar (hidden on mobile/tablet) ── */}
        <aside className="hidden lg:block lg:w-1/4 flex-shrink-0">
          <div className="sticky top-8">
            <Link href="/" className="inline-block mb-4 text-[#003527] font-bold text-2xl">
              Jernih Creatife
            </Link>
            <h1 className="text-[#191c1d] mb-2 text-2xl font-semibold tracking-tight">
              Pendaftaran Mitra
            </h1>
            <p className="text-[#404944] mb-8 text-sm leading-relaxed">
              Bergabunglah dengan Jernih Creatife dan kembangkan bisnis Anda bersama kami.
            </p>
            {/* Desktop step list */}
            <nav className="flex flex-col gap-0" aria-label="Form steps">
              {steps.map((step, idx) => {
                const num = idx + 1;
                const isActive = currentStep === num;
                const isDone = currentStep > num;
                return (
                  <div key={num}>
                    <div className={`flex items-center gap-3 ${isActive || isDone ? "" : "opacity-40"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                        isActive ? "bg-[#003527] text-white"
                        : isDone ? "bg-[#064e3b] text-white"
                        : "bg-[#e1e3e4] text-[#707974]"
                      }`}>
                        {isDone ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : num}
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${isActive ? "text-[#003527]" : isDone ? "text-[#064e3b]" : "text-[#191c1d]"}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-6 ml-4 my-1 transition-colors ${isDone ? "bg-[#064e3b]" : "bg-[#bfc9c3]"}`} />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Form Card ── */}
        <div className="w-full lg:w-3/4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6 md:p-8 lg:p-10 border border-[#e1e3e4]">
            {currentStep === 1 && <Step1 />}
            {currentStep === 2 && <Step2 />}
            {currentStep === 3 && <Step3 />}

            {/* Navigation Buttons */}
            <div className={`mt-8 flex ${currentStep > 1 ? "justify-between" : "justify-end"}`}>
              {currentStep > 1 && (
                <button
                  onClick={goPrev}
                  type="button"
                  className="border border-[#707974] text-[#191c1d] px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#f3f4f5] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                  Kembali
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={goNext}
                  type="button"
                  className="bg-[#003527] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#064e3b] transition-colors shadow-sm flex items-center gap-2"
                >
                  Lanjutkan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="bg-[#003527] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#064e3b] transition-colors shadow-sm flex items-center gap-2"
                >
                  Kirim Pendaftaran
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Footer links */}
          <p className="mt-4 text-center text-sm text-[#404944]">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#003527] font-semibold hover:underline">Masuk</Link>
            <span className="mx-1 text-[#bfc9c3]">·</span>
            <Link href="/register" className="text-[#003527] font-semibold hover:underline">Daftar sebagai pelanggan</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-4 bg-white border-t border-[#e1e3e4]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <div className="font-bold text-[#003527] text-lg">Jernih Creatife</div>
          <div className="flex flex-wrap justify-center gap-6 text-[#404944]" style={{ fontSize: "14px", fontWeight: 400 }}>
            <a className="hover:underline decoration-[#003527] transition-all" href="#">Privacy Policy</a>
            <a className="hover:underline decoration-[#003527] transition-all" href="#">Terms of Service</a>
            <a className="hover:underline decoration-[#003527] transition-all" href="#">Help Center</a>
            <a className="hover:underline decoration-[#003527] transition-all text-[#003527] font-bold" href="#">Partner Support</a>
          </div>
          <div className="text-[#404944]" style={{ fontSize: "14px", fontWeight: 400 }}>
            © 2024 Jernih Creatife. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
