import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_KEY = "mh_token";

/**
 * Verifikasi JWT dan kembalikan payload jika valid.
 * Menggunakan jose (Edge Runtime compatible) untuk verifikasi signature penuh.
 * Jika JWT_SECRET tidak dikonfigurasi, fallback ke decode-only (dev mode).
 */
async function verifyJwtPayload(token: string): Promise<{ role?: string } | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fallback dev: jangan crash jika secret belum dikonfigurasi
    // PERINGATAN: ini TIDAK aman untuk production
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { role?: string };
  } catch {
    // Token tidak valid, expired, atau signature tidak cocok
    return null;
  }
}

/** Semua route di bawah dashboard-admin butuh role ADMIN */
const ADMIN_PREFIX = "/dashboard-admin";
const ADMIN_LOGIN_PAGE = "/dashboard-admin/auth/login";

/** Semua route di bawah dashboard/pelanggan hanya untuk non-admin */
const CUSTOMER_PREFIX = "/dashboard/pelanggan";
const CUSTOMER_LOGIN_PAGE = "/dashboard/pelanggan/login";

/** Route publik — tidak perlu dicek */
const PUBLIC_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
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
        const payload = await verifyJwtPayload(token);
        if (payload?.role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard-admin/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    // Tidak ada token → redirect ke login
    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PAGE, request.url));
    }

    // Verifikasi signature JWT + cek role: harus ADMIN
    const payload = await verifyJwtPayload(token);
    if (!payload || payload.role !== "ADMIN") {
      // Token palsu / expired / non-admin mencoba akses admin → redirect ke forbidden
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

    // Verifikasi signature JWT + cek role: ADMIN tidak boleh akses customer dashboard
    const payload = await verifyJwtPayload(token);
    if (!payload) {
      // Token tidak valid / expired
      return NextResponse.redirect(new URL(CUSTOMER_LOGIN_PAGE, request.url));
    }
    if (payload.role === "ADMIN") {
      const url = new URL("/forbidden", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// Next.js otomatis deteksi proxy.ts sebagai middleware
// Matcher dibatasi hanya untuk route yang butuh proteksi — jangan load di semua halaman
export const config = {
  matcher: ["/dashboard-admin/:path*", "/dashboard/pelanggan/:path*"],
};
