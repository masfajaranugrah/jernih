// lib/auth.ts
// Utility untuk JWT token di cookies (client-side)

const TOKEN_KEY = "mh_token";

/** Simpan token ke cookie dengan expiry 7 hari (sinkron dengan JWT_EXPIRES_IN).
 *  CATATAN: Cookie ini non-HttpOnly karena admin dashboard membutuhkan
 *  akses JS ke token untuk Authorization header Bearer.
 *  Untuk HttpOnly penuh, migrasikan semua admin API call melalui Next.js BFF.
 */
export function setToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 hari — sinkron JWT_EXPIRES_IN
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure ? '; secure' : ''}`;
}

/** Baca token dari cookies */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_KEY}=`));
  return match ? match.split("=")[1] : null;
}

/**
 * Decode JWT payload tanpa verifikasi signature — cukup untuk baca name/email.
 * Jika token rusak, kembalikan null. API backend tetap menolak token palsu.
 */
export function decodeJwtToken(
  token: string
): { id?: string; name?: string; email?: string; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Dapatkan slug user dari JWT token (tanpa API call).
 * Dipakai untuk membangun link halaman (mis. wishlist) langsung tanpa
 * nunggu `/api/auth/me` selesai — menghindari flash ke halaman login.
 * Return null jika belum login / token rusak.
 */
export function getTokenSlug(): string | null {
  const decoded = decodeJwtToken(getToken() ?? "");
  if (!decoded?.name) return null;
  return decoded.name.toLowerCase().replace(/\s+/g, "-");
}

/** Hapus client-side cookie */
function removeTokenClient() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

/** Hapus token via API (hapus httpOnly cookie server) + client-side cookie */
export async function removeToken() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // tetap lanjut hapus client cookie meski API gagal
  }
  removeTokenClient();
}

/** Cek apakah user sudah login (ada token) */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Session expired — hapus token dan redirect ke login */
export async function handleSessionExpired() {
  await removeToken();
  // Simpan pesan di sessionStorage supaya halaman login bisa tampilkan notif
  sessionStorage.setItem("auth_expired", "1");
  const currentPath = window.location.pathname + window.location.search;
  window.location.href = `/dashboard-admin/auth/login?from=${encodeURIComponent(currentPath)}`;
}

/**
 * Handle 403 Forbidden — redirect ke halaman forbidden.
 * Dipanggil saat API mengembalikan 403 (authenticated tapi tidak punya akses).
 */
export function handleForbidden() {
  const currentPath = window.location.pathname + window.location.search;
  window.location.href = `/forbidden?from=${encodeURIComponent(currentPath)}`;
}
