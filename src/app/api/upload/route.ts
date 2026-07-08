import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  console.log("[upload proxy] === REQUEST MASUK ===");
  console.log("[upload proxy] BACKEND_URL:", BACKEND_URL);

  try {
    const contentType = req.headers.get("content-type") ?? "";
    console.log("[upload proxy] content-type:", contentType);

    if (!contentType.includes("multipart/form-data")) {
      console.warn("[upload proxy] Content-Type bukan multipart/form-data:", contentType);
      return NextResponse.json(
        { message: "Content-Type harus multipart/form-data" },
        { status: 400 }
      );
    }

    // Forward raw body + content-type header (dengan boundary) langsung ke backend
    console.log("[upload proxy] Membaca body...");
    const rawBody = await req.arrayBuffer();
    console.log("[upload proxy] Body size:", rawBody.byteLength, "bytes");

    console.log("[upload proxy] Mengirim ke backend:", `${BACKEND_URL}/upload`);
    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: rawBody,
    });

    console.log("[upload proxy] Response status dari backend:", res.status);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[upload proxy] Backend error:", res.status, errText);
      return NextResponse.json(
        { message: "Upload ke backend gagal", detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[upload proxy] Sukses, URLs:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[upload proxy] EXCEPTION:", err);
    console.error("[upload proxy] Error name:", (err as Error)?.name);
    console.error("[upload proxy] Error message:", (err as Error)?.message);
    console.error("[upload proxy] Error stack:", (err as Error)?.stack);
    return NextResponse.json(
      { message: "Server error saat upload" },
      { status: 500 }
    );
  }
}
