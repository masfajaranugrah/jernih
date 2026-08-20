import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/**
 * POST /api/midtrans/notification — webhook notifikasi pembayaran dari Midtrans.
 * PUBLIK (tanpa auth) — dipanggil server Midtrans.
 *
 * Diteruskan ke backend (yang memverifikasi signature & memperbarui status order).
 * Route ini memastikan webhook tetap bisa diterima meski hanya domain frontend
 * yang terekspos publik.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/midtrans/notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status_code: 500, message: "Cannot connect to backend" },
      { status: 502 },
    );
  }
}