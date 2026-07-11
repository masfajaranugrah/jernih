"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";

function RegisterPageContent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("Anda harus menyetujui syarat layanan dan kebijakan privasi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Registrasi gagal");

      const slug = data.user.name.toLowerCase().replace(/\s+/g, "-");
      router.push(`/dashboard/pelanggan/${slug}/`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row antialiased">
      {/* Left panel — branding, hidden on mobile/tablet */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between overflow-hidden">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBldZ4Y3FzFjCxhbsi6Ir3mwX1p6IfF2n_BtZ7s2FTMhxx21a9Eo_P9rqIDV867wlovyg6Ca_CafMYzawNQaymO2Jz5LS3qFO34Q-iMMWOh2Sy3xGMA97f1NuQ75TYCAsmggGV8l2gv0PRjlDJ1nz71PeTnL1LQALxOg70jNdH-otpqbF88sojNQsCW-fFfTmj6cVkx1PekbJ_VEmslp4F8wLTT7I4vwsEHxToMzZeZHtLTbecmb6Ym"
          alt="Luxury jewelry on marble surface"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-10 xl:p-14 h-full flex flex-col justify-between">
          <div className="text-white font-bold" style={{ fontSize: "48px", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
            Jernih Creatife
          </div>
          <div className="max-w-md">
            <p className="text-white mb-4" style={{ fontSize: "30px", lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: 500 }}>
              Satu akun untuk semua kebutuhan marketplace.
            </p>
            <p className="text-white/80" style={{ fontSize: "18px", lineHeight: "1.6" }}>
              Temukan produk, layanan profesional, dan peralatan sewa dengan pengalaman yang cepat dan mudah.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 sm:px-10 lg:px-12 bg-[#f8f9fa]">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-bold text-[#003527]" style={{ fontSize: "clamp(28px, 8vw, 40px)", letterSpacing: "-0.02em", fontWeight: 600 }}>
              Jernih Creatife
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#003527]">Register</p>
            <h2 className="mt-1 text-[#191c1d] font-semibold" style={{ fontSize: "clamp(22px, 5vw, 30px)", lineHeight: "1.2", letterSpacing: "-0.01em" }}>
              Buat akun baru
            </h2>
            <p className="mt-2 text-[#404944] text-sm sm:text-base">
              Daftar untuk mulai belanja, pesan jasa, atau sewa peralatan.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm text-[#ba1a1a] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-[#191c1d]" htmlFor="reg-name">
                Nama Lengkap
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#bfc9c3] bg-white px-4 focus-within:border-[#003527] focus-within:ring-1 focus-within:ring-[#003527]">
                <svg className="w-5 h-5 text-[#707974] shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0H4Z" />
                </svg>
                <input
                  type="text"
                  id="reg-name"
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 w-full bg-transparent text-sm text-[#191c1d] outline-none placeholder:text-[#9ca3af]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-[#191c1d]" htmlFor="reg-email">
                Email
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#bfc9c3] bg-white px-4 focus-within:border-[#003527] focus-within:ring-1 focus-within:ring-[#003527]">
                <svg className="w-5 h-5 text-[#707974] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input
                  type="email"
                  id="reg-email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full bg-transparent text-sm text-[#191c1d] outline-none placeholder:text-[#9ca3af]"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-[#191c1d]" htmlFor="reg-phone">
                Nomor WhatsApp
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#bfc9c3] bg-white px-4 focus-within:border-[#003527] focus-within:ring-1 focus-within:ring-[#003527]">
                <svg className="w-5 h-5 text-[#707974] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                <input
                  type="tel"
                  id="reg-phone"
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12 w-full bg-transparent text-sm text-[#191c1d] outline-none placeholder:text-[#9ca3af]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-[#191c1d]" htmlFor="reg-password">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#bfc9c3] bg-white px-4 focus-within:border-[#003527] focus-within:ring-1 focus-within:ring-[#003527]">
                <svg className="w-5 h-5 text-[#707974] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  type="password"
                  id="reg-password"
                  placeholder="Buat password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full bg-transparent text-sm text-[#191c1d] outline-none placeholder:text-[#9ca3af]"
                />
              </div>
            </div>

            {/* Agree */}
            <label className="flex items-start gap-2 text-xs sm:text-sm text-[#404944] leading-5">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#bfc9c3] accent-[#003527] shrink-0"
              />
              Saya menyetujui syarat layanan dan kebijakan privasi Jernih Creatife.
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#003527] text-sm font-bold text-white transition hover:bg-[#064e3b] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-[#404944]">
              Sudah punya akun?{" "}
              <Link href="/dashboard/pelanggan/login" className="font-bold text-[#003527] hover:underline">
                Masuk
              </Link>
            </p>
            <p className="text-sm text-[#404944]">
              Daftar sebagai mitra?{" "}
              <Link href="/register-mitra" className="font-bold text-[#003527] hover:underline">
                Daftar Mitra
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
