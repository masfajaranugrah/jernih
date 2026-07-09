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

  // Forward ke backend dengan formData yang sudah di-parse
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  } catch {
    return NextResponse.json(
      { message: "Tidak dapat terhubung ke backend" },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { message: "Upload ke backend gagal", detail: errText },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
