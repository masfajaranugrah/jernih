import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** GET /api/vouchers — voucher yang tersedia untuk pelanggan login */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("mh_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/vouchers/available`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
