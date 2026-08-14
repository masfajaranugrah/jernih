import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  console.log("[API /upload] Request masuk");
  let formData: FormData;
  try {
    formData = await req.formData();
    console.log("[API /upload] FormData berhasil dibaca. Files:", [...formData.keys()]);
  } catch (e) {
    console.error("[API /upload] Gagal membaca form data:", e);
    return NextResponse.json(
      { message: "Gagal membaca form data" },
      { status: 400 }
    );
  }

  // Forward Auth token dari cookie ke backend
  const token = req.cookies.get("mh_token")?.value;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("[API /upload] Token ditemukan, mengirim ke backend");
  } else {
    console.warn("[API /upload] ⚠️ Token TIDAK ditemukan di cookie mh_token!");
  }

  let res: Response;
  try {
    console.log("[API /upload] Mengirim ke backend:", `${BACKEND_URL}/upload`);
    res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    console.log("[API /upload] Respon dari backend:", res.status, res.statusText);
  } catch (e) {
    console.error("[API /upload] Koneksi ke backend gagal:", e);
    return NextResponse.json(
      { message: "Tidak dapat terhubung ke backend" },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("[API /upload] Backend menolak upload:", errData);
    return NextResponse.json(
      { message: errData.message ?? "Upload ke backend gagal" },
      { status: res.status }
    );
  }

  const data = await res.json();
  console.log("[API /upload] ✅ Upload berhasil! URLs:", data.urls);
  return NextResponse.json(data, { status: 200 });
}

