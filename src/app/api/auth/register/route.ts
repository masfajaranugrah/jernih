import { bffResponse } from "@/lib/bff-response";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { name, email, phone, password } = body;

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { message: "Name, email, phone, and password are required" },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
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

  // Tidak set cookie di sini — user diarahkan ke halaman login setelah registrasi,
  // token JWT baru disimpan ke cookie saat login berhasil.
  return NextResponse.json(data);
}
