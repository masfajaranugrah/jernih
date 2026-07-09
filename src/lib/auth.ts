// lib/auth.ts
// Utility untuk JWT token di cookies (client-side)

const TOKEN_KEY = "mh_token";

/** Simpan token ke cookie. Default: session cookie (tanpa maxAge) = hilang saat browser tutup.
 *  Set persistent = true agar token tetap ada sampai logout manual.
 */
export function setToken(token: string) {
  // HttpOnly tidak bisa di-set dari JS — ini sisi client untuk demo.
  // Saat sudah ada backend nyata, idealnya token di-set via server response Set-Cookie HttpOnly.
  const maxAge = 60 * 60 * 24 * 365; // 1 tahun — berlaku sampai logout
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Baca token dari cookies */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_KEY}=`));
  return match ? match.split("=")[1] : null;
}

/** Hapus token (logout) */
export function removeToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

/** Cek apakah user sudah login (ada token) */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Session expired — hapus token dan redirect ke login */
export function handleSessionExpired() {
  removeToken();
  // Simpan pesan di sessionStorage supaya halaman login bisa tampilkan notif
  sessionStorage.setItem("auth_expired", "1");
  window.location.href = "/dashboard-admin/admin/login";
}
