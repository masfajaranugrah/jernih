// midtrans/midtrans.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';

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
  shippingCost?: string | number;
  discountAmount?: string | number;
  shippingDiscount?: string | number;
}

/** Order snapshot minimal yang dibutuhkan Snap — dari Order (dgn items & user) */
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
    orderIdOverride?: string,
  ): Promise<{ token: string; redirect_url: string }> {
    if (!this.serverKey) {
      throw new BadRequestException('MIDTRANS_SERVER_KEY belum dikonfigurasi');
    }

    // order_id harus UNIK per transaksi — Midtrans menolak order_id yang pernah
    // dipakai (termasuk yang belum dibayar). Caller boleh mengirim nilai unik
    // (mis. orderNumber + suffix percobaan) lewat orderIdOverride.
    const orderId = orderIdOverride ?? order.orderNumber ?? order.id.slice(0, 9).toUpperCase();
    const grossAmount = Number(order.total) + fee;
    const shippingCost = Number(order.shippingCost ?? 0);

    const itemDetails: SnapItem[] = Array.isArray(order.items)
      ? order.items.map((i) => ({
          id: i.id,
          // Midtrans membatasi name max 50 karakter
          name: String(i.name).slice(0, 50),
          price: Number(i.price),
          quantity: i.quantity,
        }))
      : [];

    // Midtrans mensyaratkan sum(item_details) === gross_amount.
    // Karena gross_amount = total produk + ongkir + fee, tambahkan ongkir
    // sebagai item "Ongkos Kirim" agar jumlahnya konsisten.
    if (shippingCost > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        name: 'Ongkos Kirim',
        price: shippingCost,
        quantity: 1,
      });
    }

    // Karena gross_amount = total produk + ongkir + fee, tambahkan fee sebagai item "Biaya Admin".
    if (fee > 0) {
      itemDetails.push({
        id: 'FEE-ADMIN',
        name: 'Biaya Admin Pembayaran',
        price: fee,
        quantity: 1,
      });
    }

    // Voucher: tambahkan diskon produk & ongkir sebagai item bernilai NEGATIF agar
    // sum(item_details) === gross_amount (subtotal − diskonProduk + ongkir − diskonOngkir + fee).
    const productDiscount = Number(order.discountAmount ?? 0);
    const shippingDiscount = Number(order.shippingDiscount ?? 0);
    if (productDiscount > 0) {
      itemDetails.push({
        id: 'DISCOUNT-PRODUK',
        name: 'Diskon Produk',
        price: -productDiscount,
        quantity: 1,
      });
    }
    if (shippingDiscount > 0) {
      itemDetails.push({
        id: 'DISCOUNT-ONGKIR',
        name: 'Diskon Ongkir',
        price: -shippingDiscount,
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
      const midtransMsg = Array.isArray(data.error_messages)
        ? data.error_messages.join('; ')
        : data.status_message;
      throw new BadRequestException(
        `Midtrans gagal membuat pembayaran (${res.status}): ${midtransMsg ?? res.statusText ?? 'respons kosong'}`,
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

    // Midtrans: signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
    // (hash biasa dari string gabungan, BUKAN HMAC)
    const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`;
    const hash = createHash('sha512').update(raw).digest('hex');
    // Timing-safe comparison — hindari timing attack
    const hashBuf = Buffer.from(hash, 'hex');
    const keyBuf = Buffer.from(payload.signature_key, 'hex');
    if (hashBuf.length !== keyBuf.length) return false;
    return timingSafeEqual(hashBuf, keyBuf);
  }

  /**
   * Cek status transaksi ke Midtrans (fallback/recovery).
   * Dipakai saat webhook telat/gagal atau customer kembali ke halaman
   * pembayaran sementara database masih PENDING.
   * GET /{order_id}/status
   */
  async getTransactionStatus(orderId: string): Promise<any> {
    if (!this.serverKey) {
      throw new BadRequestException('MIDTRANS_SERVER_KEY belum dikonfigurasi');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/${encodeURIComponent(orderId)}/status`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`,
        },
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
      const midtransMsg = Array.isArray(data.error_messages)
        ? data.error_messages.join('; ')
        : data.status_message;
      throw new BadRequestException(
        `Midtrans gagal mengambil status (${res.status}): ${midtransMsg ?? res.statusText ?? 'respons kosong'}`,
      );
    }
    return data;
  }
}
