"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Login gagal");
      }

      // Cek apakah role adalah ADMIN
      if (data.user.role !== "ADMIN") {
        throw new Error("Akses ditolak. Hanya admin yang dapat login di halaman ini.");
      }

      // Simpan token ke cookie
      setToken(data.access_token);

      // Simpan mitraId ke cookie supaya server action tidak perlu query DB
      if (data.user.mitra?.id) {
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `mh_mitra_id=${data.user.mitra.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      // Hard redirect agar browser kirim cookie baru ke middleware
      window.location.href = "/dashboard-admin/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#191c1d] flex flex-col items-center justify-center px-4 py-12 antialiased">
      {/* Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-[#2e3132] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#003527] via-[#064e3b] to-[#95d3ba]" />

        <div className="px-6 sm:px-8 py-8 sm:py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#003527]/40 border border-[#064e3b] mb-4">
              {/* Shield icon */}
              <svg className="w-7 h-7 text-[#95d3ba]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-white font-bold text-2xl sm:text-3xl tracking-tight">
              Admin Panel
            </h1>
            <p className="text-[#9ca3af] text-sm mt-1">
              Jernih Creatife — Akses Terbatas
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 rounded-lg px-4 py-3 flex items-start gap-2">
              <svg className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#ffb4ab] text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-email"
                className="text-xs font-semibold text-[#e1e3e4] uppercase tracking-wider"
              >
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-[#707974]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eccomarket.id"
                  className="w-full bg-[#191c1d] border border-[#404944] text-white text-sm pl-9 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b] placeholder:text-[#707974] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs font-semibold text-[#e1e3e4] uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-[#707974]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#191c1d] border border-[#404944] text-white text-sm pl-9 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b] placeholder:text-[#707974] transition-colors"
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-[#9ca3af] cursor-pointer">
                <input
                  type="checkbox"
                  id="admin-remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#404944] bg-[#191c1d] accent-[#064e3b]"
                />
                Ingat saya
              </label>
              <a href="#" className="text-xs text-[#95d3ba] hover:text-[#b0f0d6] hover:underline transition-colors font-semibold">
                Lupa password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-sm py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 transform shadow-lg shadow-[#003527]/30 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          {/* Warning note */}
          <div className="mt-6 flex items-start gap-2 bg-[#191c1d] border border-[#404944] rounded-lg px-4 py-3">
            <svg className="w-4 h-4 text-[#95d3ba] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-[#9ca3af] text-xs leading-relaxed">
              Halaman ini hanya untuk administrator. Akses tidak sah akan dicatat dan dilaporkan.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <p className="mt-6 text-[#707974] text-xs text-center">
        © 2024 <span className="text-[#95d3ba] font-semibold">Jernih Creatife</span> — Admin Portal
      </p>
    </div>
  );
}
