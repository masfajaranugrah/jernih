import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { message: "Gagal membaca form data" },
      { status: 400 }
    );
  }

  // Forward Auth token dari cookie ke backend
  const token = req.cookies.get("mh_token")?.value;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    return NextResponse.json(
      { message: "Tidak dapat terhubung ke backend" },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: errData.message ?? "Upload ke backend gagal" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
