"use client";

import Link from "next/link";
import { useState, FormEvent, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken } from "@/lib/auth";

function PelangganLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = rawFrom?.startsWith("/") ? rawFrom : "/dashboard/pelanggan";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    if (rawFrom?.startsWith("/")) { router.replace(rawFrom); return; }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.name) { router.replace("/"); return; }
        const slug = data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-");
        const map: Record<string, string> = {
          wishlist:  `/dashboard/pelanggan/${slug}/wishlist`,
          orders:    `/dashboard/pelanggan/${slug}/orders`,
          vouchers:  `/dashboard/pelanggan/${slug}/vouchers`,
          profile:   `/dashboard/pelanggan/${slug}/profile`,
          chat:      `/dashboard/pelanggan/${slug}/chat`,
        };
        router.replace(map[rawFrom ?? ""] ?? `/dashboard/pelanggan/${slug}/profile`);
      })
      .catch(() => router.replace("/"));
  }, [rawFrom, router]);

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
      if (!res.ok) throw new Error(data.error || data.message || "Email atau password salah");
      const slug = data.user?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";
      if (from && from !== "/dashboard/pelanggan") {
        router.push(from);
      } else {
        router.push(window.innerWidth < 768
          ? `/dashboard/pelanggan/${slug}/profile`
          : `/dashboard/pelanggan/${slug}/orders`);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Full-screen background: ungu sangat muda dengan pola halus */
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #eff6ff 0%, #f8fafc 50%, #dbeafe 100%)" }}>

      {/* Ambient glow — tidak mengganggu, hanya atmosfer */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle at 80% 20%, #93c5fd33, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle at 20% 80%, #93c5fd33, transparent 65%)" }} />
      </div>

      <div className="relative w-full max-w-[400px]">

        {/* ─── Brand ─── */}
        <div className="text-center mb-8">
          {/* Wordmark style logo */}
          <div className="inline-flex items-center justify-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Jernih Creatife
          </h1>
          <p className="text-gray-400 text-sm mt-1">Masuk untuk melanjutkan belanja</p>
        </div>

        {/* ─── Card ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-8"
          style={{ boxShadow: "0 2px 40px rgba(37,99,235,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}>

          {/* Notifikasi registrasi berhasil */}
          {justRegistered && !error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-green-50 border border-green-200 px-3.5 py-3">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">Registrasi berhasil! Silakan masuk.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
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
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* CTA */}
            <button type="submit" disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", boxShadow: "0 4px 20px rgba(37,99,235,0.30)" }}>
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Register buttons */}
          <div className="space-y-2.5">
            <Link href="/dashboard/pelanggan/register"
              className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-medium text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
              Buat akun pelanggan baru
            </Link>
            <Link href="/register-mitra"
              className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-100 hover:bg-gray-50 transition-colors">
              Daftar sebagai Mitra
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-1">
          <Link href="/dashboard-admin/auth/login"
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
            Login sebagai Admin
          </Link>
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} Jernih Creatife</p>
        </div>
      </div>
    </div>
  );
}

export default function PelangganLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #eff6ff, #f8fafc, #dbeafe)" }}>
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <PelangganLoginContent />
    </Suspense>
  );
}
