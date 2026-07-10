import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "mh_token";

/** Semua route di bawah dashboard-admin butuh autentikasi */
const PROTECTED_PREFIX = "/dashboard-admin";

/** Halaman login — tidak perlu diproteksi */
const LOGIN_PAGE = "/dashboard-admin/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jangan proteksi halaman login itu sendiri
  if (pathname === LOGIN_PAGE || pathname.startsWith(LOGIN_PAGE + "/")) {
    const token = request.cookies.get(TOKEN_KEY)?.value;
    // Sudah login → balik ke dashboard admin
    if (token) {
      return NextResponse.redirect(new URL("/dashboard-admin/admin", request.url));
    }
    return NextResponse.next();
  }

  // Semua route /dashboard-admin/* butuh token
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const token = request.cookies.get(TOKEN_KEY)?.value;
    if (!token) {
      return NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
