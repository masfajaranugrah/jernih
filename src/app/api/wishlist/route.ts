import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** Ambil token dari cookie HttpOnly, forward ke backend sebagai Bearer */
function getAuth(req: NextRequest): string | null {
  return req.cookies.get("mh_token")?.value ?? null;
}

/** GET /api/wishlist — daftar wishlist user login */
export async function GET(req: NextRequest) {
  const token = getAuth(req);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** POST /api/wishlist — tambah produk { productId } */
export async function POST(req: NextRequest) {
  const token = getAuth(req);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: body.productId }),
    });
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
