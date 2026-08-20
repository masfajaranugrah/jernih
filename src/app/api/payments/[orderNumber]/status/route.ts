import { bffResponse } from "@/lib/bff-response";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** GET /api/payments/:orderNumber/status — status pembayaran dari database (source of truth) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const token = req.cookies.get("mh_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { orderNumber } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/payments/${orderNumber}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    return bffResponse(data, res.status);
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }
}