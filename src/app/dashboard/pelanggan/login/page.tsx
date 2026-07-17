"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard/pelanggan";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (!res.ok) throw new Error(data.error || data.message || "Email atau password salah");

      const slug = data.user.name.toLowerCase().replace(/\s+/g, "-");
      localStorage.setItem("mh_user", JSON.stringify({ name: data.user.name, slug }));
      router.push(`/dashboard/pelanggan/${slug}/orders`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex items-center justify-center w-full min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#e1e3e4] overflow-hidden">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHk7GeDBq48MIho-mGEmgvjVVa3fDzSUlGd2TyWxBUjpnEKtr597bxzWy4p5QGM7HfeRcIQ9kSCvJ9NcP-PDufKnbj20mNYtXhVD_WQ7QYo1-8Eg5vYGzJTqDNtFd2AgFx_F72u0wXAePwhuTiHOK8dfA8ZhIjRG2yBkUuHGUYvJweEcGmCCP6vKOdJBeK_yk-ZgmFOkRBJkOCH7iuByt6T8WspgLMUUOmIxwAJAx9qIP3oiBcGBLS"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003527]/40 to-transparent" />
        <div className="absolute inset-0 bg-[#003527]/10" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:w-[480px] bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <h2 className="font-bold text-[#003527] tracking-tight"
            style={{ fontSize: "clamp(32px,6vw,48px)", lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: 600 }}>
            Jernih Creatife
          </h2>
          <h3 className="mt-3 font-semibold text-[#191c1d]"
            style={{ fontSize: "clamp(20px,4vw,30px)", lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: 500 }}>
            Welcome back
          </h3>
          <p className="mt-2 text-[#404944] text-sm sm:text-base">
            Masuk ke akun pelanggan Jernih Creatife Anda.
          </p>
        </div>

        {/* Notif sukses registrasi */}
        {justRegistered && !error && (
          <div className="mb-4 rounded-lg bg-[#b0f0d6] border border-[#064e3b]/20 px-4 py-3 text-sm text-[#003527] font-medium">
            Registrasi berhasil! Silakan masuk dengan akun yang baru dibuat.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm text-[#ba1a1a] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[#191c1d] text-xs sm:text-sm font-semibold tracking-wide" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#707974]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-10 pr-4 py-3 border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527] focus:border-[#003527] bg-white text-[#191c1d] text-sm transition-shadow outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[#191c1d] text-xs sm:text-sm font-semibold tracking-wide" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#707974]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-3 border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527] focus:border-[#003527] bg-white text-[#191c1d] text-sm transition-shadow outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-[#064e3b] hover:bg-[#043b2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#064e3b] transition-all duration-200 hover:-translate-y-0.5 transform disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? "Memproses..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-[#404944]">
            Belum punya akun?{" "}
            <Link href="/dashboard/pelanggan/register" className="font-bold text-[#003527] hover:underline">
              Daftar
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
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
