import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { message: "Content-Type harus multipart/form-data" },
      { status: 400 }
    );
  }

  // Forward body stream langsung ke backend — tidak dibaca dua kali
  const res = await fetch(`${BACKEND_URL}/upload`, {
    method: "POST",
    headers: { "content-type": contentType },
    // req.body adalah ReadableStream — Node.js fetch bisa terima langsung
    body: req.body,
    // @ts-expect-error — duplex diperlukan untuk streaming request body di Node 18+
    duplex: "half",
  });

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
