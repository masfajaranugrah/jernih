import { bffResponse } from "@/lib/bff-response";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("mh_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (res.status === 401) {
    // Token basi/invalid — hapus cookie supaya request berikutnya berhenti (hindari 401 berulang)
    const cleared = NextResponse.json(data, { status: 401 });
    cleared.cookies.set("mh_token", "", { path: "/", maxAge: 0 });
    return cleared;
  }

  if (!res.ok) {
    return bffResponse(data, res.status);
  }

  return NextResponse.json(data);
}
