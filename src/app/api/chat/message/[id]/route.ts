import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

function getAuth(req: NextRequest): string | null {
  return req.cookies.get("mh_token")?.value ?? null;
}

/** DELETE /api/chat/message/[id] — hapus pesan untuk semua */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getAuth(req);
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/chat/message/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
