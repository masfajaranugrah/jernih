"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Shared input class ───────────────────────────────────────────────────────
const field =
  "block w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const fieldTextarea =
  "block w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none";

const steps = ["Informasi Dasar", "Alamat & Lokasi", "Verifikasi Identitas"];

// ─── Step 1 ──────────────────────────────────────────────────────────────────
function Step1() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Informasi Dasar</h2>
        <p className="text-sm text-gray-400 mt-0.5">Data diri dan informasi usaha Anda.</p>
      </div>
      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Nama Lengkap <span className="text-gray-400 font-normal">(sesuai KTP)</span>
          </label>
          <input id="fullName" type="text" autoComplete="name" placeholder="Masukkan nama lengkap" className={field} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="nama@email.com" className={field} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input id="phone" type="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" className={field} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Nama Usaha / Toko</label>
              <span className="text-xs text-gray-400">Opsional</span>
            </div>
            <input id="businessName" type="text" placeholder="Nama toko Anda" className={field} />
            <p className="text-xs text-gray-400">Kosongkan jika mendaftar sebagai individu.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Kategori Usaha</label>
            <select id="businessType" defaultValue=""
              className="block w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none">
              <option disabled value="">Pilih kategori</option>
              <option value="retail">Retail / Barang Konsumsi</option>
              <option value="fnb">Makanan & Minuman</option>
              <option value="services">Jasa</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────
function Step2() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Alamat & Lokasi</h2>
        <p className="text-sm text-gray-400 mt-0.5">Alamat tempat usaha Anda beroperasi.</p>
      </div>
      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
          <textarea id="address" placeholder="Jl. Contoh No. 123, RT/RW 01/02" rows={3} className={fieldTextarea} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provinsi</label>
            <select id="province" defaultValue=""
              className="block w-full px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none">
              <option disabled value="">Pilih provinsi</option>
              <option value="jatim">Jawa Timur</option>
              <option value="jabar">Jawa Barat</option>
              <option value="jateng">Jawa Tengah</option>
              <option value="dki">DKI Jakarta</option>
              <option value="bali">Bali</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota / Kabupaten</label>
            <input id="city" type="text" placeholder="Nama kota" className={field} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">Kecamatan</label>
            <input id="district" type="text" placeholder="Nama kecamatan" className={field} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Kode Pos</label>
            <input id="postalCode" type="text" placeholder="12345" maxLength={5} className={field} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="mapsLink" className="block text-sm font-medium text-gray-700">Link Google Maps</label>
            <span className="text-xs text-gray-400">Opsional</span>
          </div>
          <input id="mapsLink" type="url" placeholder="https://maps.app.goo.gl/..." className={field} />
          <p className="text-xs text-gray-400">Memudahkan pelanggan menemukan lokasi usaha Anda.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────
function Step3() {
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Verifikasi Identitas</h2>
        <p className="text-sm text-gray-400 mt-0.5">Data ini hanya digunakan untuk verifikasi mitra.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          Data identitas Anda dijaga kerahasiaannya sesuai kebijakan privasi Jernih Creatife.
        </p>
      </div>

      <div className="space-y-4">
        {/* NIK */}
        <div className="space-y-1.5">
          <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK (Nomor KTP)</label>
          <input id="nik" type="text" placeholder="16 digit nomor KTP" maxLength={16} className={field} />
        </div>

        {/* KTP Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Foto KTP</label>
          <p className="text-xs text-gray-400">Seluruh bagian terbaca jelas. Format JPG/PNG, maks. 5 MB.</p>
          <label htmlFor="ktpUpload"
            className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all overflow-hidden">
            {ktpPreview
              ? <img src={ktpPreview} alt="KTP" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
              : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium text-gray-500">Klik untuk upload foto KTP</span>
                  <span className="text-xs">JPG, PNG hingga 5 MB</span>
                </div>
              )
            }
            <input id="ktpUpload" type="file" accept="image/jpeg,image/png" className="sr-only"
              onChange={(e) => handleFile(e, setKtpPreview)} />
          </label>
          {ktpPreview && (
            <button type="button" onClick={() => setKtpPreview(null)}
              className="text-xs text-red-500 hover:underline">Hapus foto</button>
          )}
        </div>

        {/* Selfie Upload */}
        <div className="space-y-2 pt-3 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700">Selfie Memegang KTP</label>
          <p className="text-xs text-gray-400">Wajah dan tulisan KTP terlihat jelas. Format JPG/PNG, maks. 5 MB.</p>
          <label htmlFor="selfieUpload"
            className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all overflow-hidden">
            {selfiePreview
              ? <img src={selfiePreview} alt="Selfie KTP" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
              : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-500">Klik untuk upload selfie + KTP</span>
                  <span className="text-xs">JPG, PNG hingga 5 MB</span>
                </div>
              )
            }
            <input id="selfieUpload" type="file" accept="image/jpeg,image/png" className="sr-only"
              onChange={(e) => handleFile(e, setSelfiePreview)} />
          </label>
          {selfiePreview && (
            <button type="button" onClick={() => setSelfiePreview(null)}
              className="text-xs text-red-500 hover:underline">Hapus foto</button>
          )}
        </div>

        {/* Agreement */}
        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <div className="relative flex-shrink-0 mt-0.5">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only peer" />
            <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
              {agreed && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500 leading-relaxed">
            Saya menyatakan data yang dimasukkan benar dan menyetujui{" "}
            <a href="#" className="text-blue-600 font-medium hover:underline">Syarat & Ketentuan</a>
            {" "}serta{" "}
            <a href="#" className="text-blue-600 font-medium hover:underline">Kebijakan Privasi</a>
            {" "}Jernih Creatife.
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RegisterMitraForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #eff6ff 0%, #f8fafc 50%, #dbeafe 100%)" }}>

      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle at 80% 10%, #93c5fd33, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle at 20% 90%, #93c5fd33, transparent 65%)" }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">Jernih Creatife</span>
          </div>
          <Link href="/dashboard/pelanggan/login" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
            Sudah punya akun? Masuk
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* ── Sidebar step indicator ── */}
          <aside className="lg:w-56 flex-shrink-0">
            {/* Mobile: horizontal pill bar */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              {steps.map((_, i) => {
                const n = i + 1;
                return (
                  <div key={n} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full h-1.5 rounded-full transition-all ${
                      step > n ? "bg-blue-600" : step === n ? "bg-blue-400" : "bg-gray-200"
                    }`} />
                    <span className={`text-[10px] font-semibold transition-colors ${
                      step >= n ? "text-blue-600" : "text-gray-400"
                    }`}>
                      {steps[i].split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop: vertical step list */}
            <div className="hidden lg:block sticky top-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Pendaftaran Mitra</p>
              <nav className="space-y-1">
                {steps.map((label, i) => {
                  const n = i + 1;
                  const isActive = step === n;
                  const isDone = step > n;
                  return (
                    <div key={n} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors"
                      style={isActive ? { background: "rgba(37,99,235,0.08)" } : {}}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                        isActive ? "text-white" : isDone ? "text-white" : "bg-gray-100 text-gray-400"
                      }`}
                        style={isActive || isDone ? { background: "linear-gradient(135deg, #1d4ed8, #2563eb)" } : {}}>
                        {isDone
                          ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          : n
                        }
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isActive ? "text-blue-700" : isDone ? "text-blue-600" : "text-gray-400"
                      }`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── Form card ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100/80 p-7 sm:p-9"
              style={{ boxShadow: "0 2px 40px rgba(37,99,235,0.07), 0 1px 3px rgba(0,0,0,0.04)" }}>

              {step === 1 && <Step1 />}
              {step === 2 && <Step2 />}
              {step === 3 && <Step3 />}

              {/* Navigation */}
              <div className={`mt-8 pt-6 border-t border-gray-100 flex items-center ${step > 1 ? "justify-between" : "justify-end"}`}>
                {step > 1 && (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Kembali
                  </button>
                )}

                {step < 3 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                    style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }}>
                    Lanjutkan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <button type="button" onClick={() => router.push("/register-mitra/success")}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                    style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }}>
                    Kirim Pendaftaran
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-gray-400">
              Bukan mitra?{" "}
              <Link href="/dashboard/pelanggan/register" className="text-blue-600 font-medium hover:underline">
                Daftar sebagai pelanggan
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
