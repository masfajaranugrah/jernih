import { bffResponse } from "@/lib/bff-response";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("mh_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

  return NextResponse.json(data);
}
