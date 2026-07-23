import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  // Forward token ke backend untuk increment tokenVersion
  const token = req.cookies.get("mh_token")?.value;
  if (token) {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Abaikan error backend — tetap hapus cookie
    }
  }

  const response = NextResponse.json({ ok: true });

  // Hapus cookie httpOnly
  response.cookies.set("mh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
