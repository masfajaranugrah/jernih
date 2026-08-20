import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

function getAuth(req: NextRequest): string | null {
  return req.cookies.get("mh_token")?.value ?? null;
}

/** GET /api/wishlist/count — jumlah wishlist user (ringan, untuk badge) */
export async function GET(req: NextRequest) {
  const token = getAuth(req);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/wishlist/count`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.status === 401) {
      // Token basi/invalid — hapus cookie supaya request berikutnya berhenti (hindari 401 berulang)
      const cleared = NextResponse.json(data, { status: 401 });
      cleared.cookies.set("mh_token", "", { path: "/", maxAge: 0 });
      return cleared;
    }
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }
}
