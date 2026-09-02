"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = rawFrom?.startsWith("/") ? rawFrom : "/dashboard-admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Email atau password salah");
      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">

      {/* ════════════════════════════════
          KIRI — Branding full-height
      ════════════════════════════════ */}
      <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-16 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0c2461 0%, #1d4ed8 45%, #2563eb 100%)" }}>

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-[-120px] right-[-80px] w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(147,197,253,0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-80px] left-[-60px] w-[320px] h-[320px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)" }} />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white/90 font-semibold text-sm tracking-wide">Jernih Creatife</span>
        </div>

        {/* Center: Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
            <span className="text-blue-200 text-xs font-medium tracking-widest uppercase">Admin Panel</span>
          </div>

          <h1 className="text-white font-bold leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", letterSpacing: "-0.02em" }}>
            Kelola bisnis<br />
            <span style={{ color: "#d8b4fe" }}>dari satu tempat.</span>
          </h1>

          <p className="text-white/55 leading-relaxed max-w-[340px]"
            style={{ fontSize: "0.9375rem" }}>
            Panel administrasi lengkap untuk mengelola produk, pesanan, mitra, dan laporan bisnis Anda secara real-time.
          </p>

          {/* Stat cards */}
          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              { n: "1.2K+", label: "Produk" },
              { n: "8.4K+", label: "Pesanan" },
              { n: "3.6K+", label: "Pelanggan" },
            ].map(({ n, label }) => (
              <div key={label}
                className="rounded-2xl border border-white/10 px-4 py-4 text-center"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
                <p className="text-white font-bold text-xl">{n}</p>
                <p className="text-white/45 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Trusted by */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-medium">Dipercaya oleh</p>
          <div className="flex items-center gap-5">
            {["Mitra Aktif", "UMKM Lokal", "Tim Kreatif"].map((s) => (
              <span key={s} className="text-white/50 text-sm font-medium">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          KANAN — Form
      ════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Jernih Creatife</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
              Selamat datang
            </h2>
            <p className="text-gray-400 text-[0.9375rem]">Masuk untuk mengakses panel admin.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jernih.id"
                className="block w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"}
                  autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword
                    ? <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? "#2563eb" : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", boxShadow: "0 4px 24px rgba(37,99,235,0.35)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memverifikasi...
                </>
              ) : "Masuk ke Dashboard"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm">
            <Link href="/dashboard/pelanggan/login"
              className="text-gray-400 hover:text-blue-600 transition-colors">
              Login Pelanggan
            </Link>
            <Link href="/dashboard/pelanggan/register"
              className="text-gray-400 hover:text-blue-600 transition-colors">
              Daftar Akun
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-gray-300">
            © {new Date().getFullYear()} Jernih Creatife
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
