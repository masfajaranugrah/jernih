// midtrans/midtrans.controller.ts
import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MidtransService } from './midtrans.service';
import { orders } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Controller('midtrans')
export class MidtransController {
  constructor(
    private readonly database: DatabaseService,
    private midtrans: MidtransService,
  ) {}

  /**
   * Webhook notifikasi pembayaran dari Midtrans.
   * PUBLIC (tanpa guard auth) — dipanggil server Midtrans.
   * Endpoint: POST /api/midtrans/notification
   *
   * KEAMANAN: signature WAJIB valid. Tanpa signature yang benar, webhook DITOLAK.
   * Ini mencegah penyerang memalsukan notifikasi "sudah bayar" untuk order yang belum dibayar.
   */
  @Post('notification')
  async notification(@Body() payload: any) {
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      fraud_status,
      signature_key,
      payment_type,
      merchant_id,
    } = payload ?? {};

    // 1) Signature WAJIB ada & valid — tolak jika tidak cocok
    if (!order_id || !signature_key) {
      throw new UnauthorizedException('Missing signature');
    }
    const valid = this.midtrans.verifyNotification({
      order_id,
      status_code,
      gross_amount,
      signature_key,
    });
    if (!valid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 1b) (Defense-in-depth) Jika MIDTRANS_MERCHANT_ID dikonfigurasi, pastikan sesuai
    const expectedMerchant = process.env.MIDTRANS_MERCHANT_ID;
    if (expectedMerchant && merchant_id && merchant_id !== expectedMerchant) {
      throw new UnauthorizedException('Merchant mismatch');
    }

    // 2) Cari order — WAJIB berdasarkan orderNumber (unik), bukan input bebas
    const [order] = await this.database.db.select().from(orders).where(eq(orders.orderNumber, order_id));
    if (!order) {
      throw new BadRequestException('Order tidak ditemukan');
    }

    // 3) Verifikasi jumlah bayar sesuai ekspektasi (total + fee) — cegah tamper nominal
    const expectedAmount = Number(order.total) + Number(order.paymentFee ?? 0);
    const notifiedAmount = Number(String(gross_amount).replace(/\./g, ''));
    if (Math.abs(expectedAmount - notifiedAmount) > 0.01) {
      throw new UnauthorizedException('Amount mismatch');
    }

    // 4) Proteksi status: jangan biarkan order yang sudah dibayar turun statusnya
    const isPaid = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status);

    // Set status order sesuai hasil transaksi Midtrans
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      // Kalau sudah dibayar, jangan ubah apa-apa (idempoten)
      if (isPaid) return { status_code: 200, message: 'Already processed' };

      const isFraudRisk = fraud_status === 'challenge';
      await this.database.db
        .update(orders)
        .set({
          status: isFraudRisk ? 'PENDING' : 'CONFIRMED',
          paidAt: isFraudRisk ? order.paidAt : new Date(),
          paymentMethod: order.paymentMethod ?? payment_type ?? null,
          midtransTransactionId: order_id ?? null,
        })
        .where(eq(orders.id, order.id));
    } else if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
      // Order yang sudah dibayar TIDAK boleh dibatalkan oleh notifikasi telat/bohong
      if (isPaid) return { status_code: 200, message: 'Paid order unchanged' };

      await this.database.db
        .update(orders)
        .set({ status: 'CANCELLED', midtransTransactionId: order_id ?? null })
        .where(eq(orders.id, order.id));
    } else {
      // pending / other — update paymentMethod saja
      await this.database.db
        .update(orders)
        .set({ midtransTransactionId: order_id ?? null })
        .where(eq(orders.id, order.id));
    }

    return { status_code: 200, message: 'Notification processed' };
  }
}