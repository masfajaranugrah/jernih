import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:3001/api";

/** Generate 12-digit random order number */
function generateOrderNumber(): string {
  const digits = "0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += digits[Math.floor(Math.random() * digits.length)];
  }
  return result;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("mh_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let body: { productId?: string; name?: string; price?: number; quantity?: number; tipe?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.productId || !body.name || !body.price) {
    return NextResponse.json({ message: "productId, name, dan price wajib diisi" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();
  const quantity = body.quantity || 1;
  const total = body.price * quantity;
  const productName = body.tipe ? `${body.name} (${body.tipe})` : body.name;

  // Kirim ke backend untuk buat order
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderNumber,
        items: [{ productId: body.productId, name: productName, price: body.price, quantity }],
        notes: `Pesanan dari chat — ${orderNumber}`,
      }),
    });
  } catch {
    return NextResponse.json({ message: "Cannot connect to backend" }, { status: 502 });
  }

  const data = await res.json();

  // Kirim notifikasi via backend chat gateway (system message)
  if (res.ok) {
    try {
      await fetch(`${BACKEND_URL}/chat/system-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `✅ Pesanan #${orderNumber} sudah dibuat!\n\nSilahkan lakukan pembayaran ke:\nBank BCA: 1234567890 a.n. Jernih Creatife\n\n📱 Konfirmasi pembayaran: kirim bukti transfer ke chat ini.\n\n*Mohon jangan hapus nomor pesanan ini.*`,
          type: "system_order",
          orderNumber,
        }),
      });
    } catch {
      // Notifikasi chat gagal, order tetap terbuat
    }
  }

  return NextResponse.json({ ...data, orderNumber }, { status: res.status });
}
