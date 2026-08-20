import { bffResponse } from "@/lib/bff-response";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** DELETE /api/orders/:id/vouchers/:voucherId — hapus voucher dari order */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; voucherId: string }> },
) {
  const token = req.cookies.get("mh_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const { id, voucherId } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/orders/${id}/vouchers/${voucherId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return bffResponse(data, res.status);
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }
}