// Helper untuk BFF routes — amankan error response dari backend
// Mencegah bocornya stack trace, SQL error, internal IP, dll ke client

import { NextResponse } from "next/server";

export function bffResponse(data: unknown, status: number) {
  // Jika response error (4xx/5xx), sanitasi message-nya
  if (status >= 400) {
    const msg =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>).message
        : undefined;

    // Hanya kirim message yang aman — jangan kirim detail internal
    return NextResponse.json(
      {
        message:
          typeof msg === "string" && msg.length < 200
            ? msg
            : "Terjadi kesalahan",
      },
      { status },
    );
  }

  // Response sukses — kirim apa adanya
  return NextResponse.json(data, { status });
}
