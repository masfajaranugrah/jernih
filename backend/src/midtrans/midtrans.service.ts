// midtrans/midtrans.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

const SANDBOX_BASE = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
const PROD_BASE = 'https://app.midtrans.com/snap/v1/transactions';

interface SnapItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

/** Order snapshot minimal yang dibutuhkan Snap — dari Order (dgn items & user) */
export interface SnapOrderInput {
  orderNumber: string | null;
  id: string;
  total: string | number;
  items?: Array<{ id: string; name: string; price: string | number; quantity: number }>;
  user?: { email?: string | null; name?: string | null; phone?: string | null } | null;
  paymentMethod?: string | null;
}

/** Bentuk order dari Prisma (Decimal diubah jadi number saat diteruskan) */
export interface SnapOrderLike extends SnapOrderInput {
  total: any;
  items?: any[];
  user?: any;
}

@Injectable()
export class MidtransService {
  private get baseUrl(): string {
    return process.env.MIDTRANS_IS_PRODUCTION === 'true' ? PROD_BASE : SANDBOX_BASE;
  }

  private get serverKey(): string {
    return process.env.MIDTRANS_SERVER_KEY ?? '';
  }

  /**
   * Buat Snap token untuk order. `channel` = nilai enabled_payments (mis. 'bca_va').
   * `fee` = biaya admin yang ditambahkan ke gross_amount (di-tagih ke pelanggan).
   */
  async createSnapToken(
    order: SnapOrderLike,
    channel: string,
    fee = 0,
  ): Promise<{ token: string; redirect_url: string }> {
    if (!this.serverKey) {
      throw new BadRequestException('MIDTRANS_SERVER_KEY belum dikonfigurasi');
    }

    const orderId = order.orderNumber ?? order.id.slice(0, 9).toUpperCase();
    const grossAmount = Number(order.total) + fee;

    const itemDetails: SnapItem[] = Array.isArray(order.items)
      ? order.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
        }))
      : [];

    // Midtrans mensyaratkan sum(item_details) === gross_amount.
    // Karena gross_amount = total produk + fee, tambahkan fee sebagai item "Biaya Admin".
    if (fee > 0) {
      itemDetails.push({
        id: 'FEE-ADMIN',
        name: 'Biaya Admin Pembayaran',
        price: fee,
        quantity: 1,
      });
    }

    const body = {
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      item_details: itemDetails,
      customer_details: {
        email: order.user?.email ?? null,
        first_name: order.user?.name ?? null,
        phone: order.user?.phone ?? null,
      },
      enabled_payments: [channel],
    };

    const auth = Buffer.from(`${this.serverKey}:`).toString('base64');

    // Timeout agar server tidak hang jika Midtrans lambat/tidak responsif (jaga availability)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    let res: Response;
    try {
      res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        throw new BadRequestException('Midtrans timeout — coba lagi');
      }
      throw new BadRequestException('Gagal terhubung ke Midtrans');
    } finally {
      clearTimeout(timer);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new BadRequestException(
        `Midtrans gagal membuat pembayaran: ${data.status_message ?? res.statusText}`,
      );
    }

    return { token: data.token, redirect_url: data.redirect_url };
  }

  /**
   * Verifikasi signature notifikasi Midtrans — WAJIB cocok.
   * Signature = HMAC-SHA512(order_id + status_code + gross_amount + server_key).
   * `gross_amount` harus persis seperti yang dikirim Midtrans (string).
   */
  verifyNotification(payload: {
    order_id: string;
    status_code: string | number;
    gross_amount: string;
    signature_key?: string;
  }): boolean {
    if (!this.serverKey) return false;
    if (!payload.signature_key || !payload.order_id || !payload.gross_amount) return false;

    // Gunakan server key sesuai environment (Midtrans menghitung signature dgn server key yang sama)
    const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`;
    const hash = createHmac('sha512', this.serverKey).update(raw).digest('hex');
    // Timing-safe comparison — hindari timing attack
    const hashBuf = Buffer.from(hash, 'hex');
    const keyBuf = Buffer.from(payload.signature_key, 'hex');
    if (hashBuf.length !== keyBuf.length) return false;
    return timingSafeEqual(hashBuf, keyBuf);
  }
}
