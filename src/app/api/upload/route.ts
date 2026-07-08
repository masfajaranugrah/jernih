import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  try {
    // Ambil raw body stream — JANGAN parse formData() karena akan merusak boundary
    const contentType = req.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { message: "Content-Type harus multipart/form-data" },
        { status: 400 }
      );
    }

    // Forward raw body + content-type header (dengan boundary) langsung ke backend
    const rawBody = await req.arrayBuffer();

    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      headers: {
        "content-type": contentType, // PENTING: sertakan boundary asli
      },
      body: rawBody,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[upload proxy] backend error:", res.status, errText);
      return NextResponse.json(
        { message: "Upload ke backend gagal", detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[upload proxy] error:", err);
    return NextResponse.json(
      { message: "Server error saat upload" },
      { status: 500 }
    );
  }
}
