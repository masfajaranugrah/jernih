import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "mh_token";

/**
 * Decode JWT payload tanpa verifikasi signature — cukup untuk baca role.
 * Jika token palsu, API backend tetap akan menolak di endpoint sebenarnya.
 */
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // JWT payload adalah base64url — konversi dulu ke base64 standar
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Semua route di bawah dashboard-admin butuh role ADMIN */
const ADMIN_PREFIX = "/dashboard-admin";
const ADMIN_LOGIN_PAGE = "/dashboard-admin/admin/login";

/** Semua route di bawah dashboard/pelanggan hanya untuk non-admin */
const CUSTOMER_PREFIX = "/dashboard/pelanggan";
const CUSTOMER_LOGIN_PAGE = "/dashboard/pelanggan/login";

/** Route publik — tidak perlu dicek */
const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes (login, register)
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.includes(r));
  if (isPublic) return NextResponse.next();

  // ── Admin route protection ──
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const token = request.cookies.get(TOKEN_KEY)?.value;

    // Halaman login admin: jika sudah login → redirect ke dashboard
    if (pathname === ADMIN_LOGIN_PAGE || pathname.startsWith(ADMIN_LOGIN_PAGE + "/")) {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard-admin/admin", request.url));
      }
      return NextResponse.next();
    }

    // Tidak ada token → redirect ke login
    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PAGE, request.url));
    }

    // Cek role: harus ADMIN
    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "ADMIN") {
      // Non-admin mencoba akses admin → 403 Forbidden
      const url = new URL("/forbidden", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ── Customer dashboard protection ──
  if (pathname.startsWith(CUSTOMER_PREFIX)) {
    const token = request.cookies.get(TOKEN_KEY)?.value;

    if (!token) {
      return NextResponse.redirect(new URL(CUSTOMER_LOGIN_PAGE, request.url));
    }

    // Cek role: ADMIN tidak boleh akses customer dashboard
    const payload = decodeJwtPayload(token);
    if (payload?.role === "ADMIN") {
      const url = new URL("/forbidden", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// Next.js 16 otomatis deteksi proxy.ts sebagai middleware
// Matcher dibatasi hanya untuk route yang butuh proteksi — jangan load di semua halaman
export const config = {
  matcher: ["/dashboard-admin/:path*", "/dashboard/pelanggan/:path*"],
};
