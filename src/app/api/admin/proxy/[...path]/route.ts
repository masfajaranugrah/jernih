// BFF Proxy — semua API call admin dashboard lewat sini
// Baca HttpOnly cookie server-side, forward ke backend sebagai Bearer token
// Aman dari XSS karena token tidak pernah terekspose ke JavaScript

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

// Keep-alive agent — reuse TCP connection antar request
const BACKEND_AGENT = BACKEND_URL.startsWith("https")
  ? new HttpsAgent({ keepAlive: true, maxSockets: 64, timeout: 5000 })
  : new HttpAgent({ keepAlive: true, maxSockets: 64, timeout: 5000 });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, params, "POST");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, params, "PATCH");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, params, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, params, "DELETE");
}

async function proxy(
  req: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
  method: string,
) {
  const { path } = await paramsPromise;
  const apiPath = path.join("/");

  // Forward query string
  const qs = req.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${apiPath}${qs ? `?${qs}` : ""}`;

  // Baca HttpOnly cookie server-side — aman, tidak bisa diakses JavaScript
  const token = req.cookies.get("mh_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // Build headers — forward Content-Type, jangan forward Authorization dari client
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const contentType = req.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers["Content-Type"] = contentType;
  }

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.clone().text();
    } catch {
      body = undefined;
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body || undefined,
      agent: BACKEND_AGENT,
    } as RequestInit & { agent: HttpAgent });

    const data = await res.json().catch(() => null);
    // Pastikan body ter-consumed agar keep-alive connection kembali ke pool
    if (res.body) await res.arrayBuffer().catch(() => {});

    // Revalidate cache Next.js untuk data yang diubah admin
    // Next.js 16: revalidateTag() butuh 2 argumen (tag, profile)
    if (res.ok) {
      if (apiPath === "settings/homepage_sections") {
        revalidateTag("homepage_sections", { expire: 0 });
      }
      if (apiPath.startsWith("hero")) {
        revalidateTag("hero", { expire: 0 });
      }
      if (apiPath.startsWith("promo")) {
        revalidateTag("promo", { expire: 0 });
      }
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Cannot connect to backend" },
      { status: 502 },
    );
  }
}
