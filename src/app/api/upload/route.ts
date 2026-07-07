import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  // Teruskan multipart/form-data langsung ke backend
  const formData = await req.formData();

  const res = await fetch(`${BACKEND_URL}/upload`, {
    method: "POST",
    body: formData as unknown as BodyInit,
    // Jangan set Content-Type — biarkan browser/fetch menambahkan boundary sendiri
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// Matikan body parser Next.js bawaan agar multipart tidak rusak
export const config = {
  api: { bodyParser: false },
};
