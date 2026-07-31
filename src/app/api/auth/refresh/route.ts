import { bffResponse } from "@/lib/bff-response";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("mh_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (!res.ok) {
    return bffResponse(data, res.status);
  }

  const response = NextResponse.json(data);
  // Token baru ikut membawa name terbaru (mis. setelah edit profil)
  response.cookies.set("mh_token", data.access_token, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari — sinkron dengan JWT_EXPIRES_IN
  });
  return response;
}
