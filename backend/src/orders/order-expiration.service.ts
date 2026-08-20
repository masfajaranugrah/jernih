// orders/order-expiration.service.ts
// Scheduler backend utk membatalkan order yang belum dibayar dalam batas waktu
// 24 jam (paymentDeadline = createdAt + 24 jam).
//
// Auto-cancel HARUS dari backend (bukan setTimeout/setInterval frontend):
// - customer bisa menutup browser / mematikan HP / offline
// - scheduler berjalan periodik di backend & tetap membatalkan order
//
// Race-condition guard: sebelum cancel, cek payment status terbaru dalam
// transaksi (row lock). Jika sudah PAID → JANGAN cancel, walau deadline lewat.

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { orders, payments } from '../../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { PAYMENT_EXPIRY_MS } from './orders.service';

const RUN_INTERVAL_MS = 60_000; // 1 menit
const BATCH_SIZE = 200;

@Injectable()
export class OrderExpirationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('OrderExpiration');
  private timer?: NodeJS.Timeout;

  constructor(private readonly database: DatabaseService) {}

  onModuleInit() {
    // Jalankan sekali saat boot (backlog order expired) lalu setiap interval.
    this.run().catch((e) => this.logger.error('Gagal menjalankan order expiration (boot)', e));
    this.timer = setInterval(() => {
      this.run().catch((e) => this.logger.error('Gagal menjalankan order expiration', e));
    }, RUN_INTERVAL_MS);
    this.logger.log('Order expiration scheduler aktif (interval 1 menit, batas 24 jam)');
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Cari order dengan:
   * - status = PENDING
   * - createdAt + 24 jam <= NOW()
   * lalu set order.status = CANCELLED & payment.status = EXPIRED (idempotent).
   */
  async run() {
    const cutoff = new Date(Date.now() - PAYMENT_EXPIRY_MS);

    const candidates = await this.database.db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.status, 'PENDING'), lt(orders.createdAt, cutoff)))
      .limit(BATCH_SIZE);

    for (const { id } of candidates) {
      try {
        await this.cancelExpiredOrder(id);
      } catch (e) {
        this.logger.error(`Gagal auto-cancel order ${id}`, e);
      }
    }
  }

  private async cancelExpiredOrder(orderId: string) {
    await this.database.db.transaction(async (tx) => {
      // Lock order row — serialisasi dengan webhook pembayaran yang bersamaan.
      const [lockedOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .for('update');
      if (!lockedOrder || lockedOrder.status !== 'PENDING') return;

      const [payment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId))
        .orderBy(sql`${payments.createdAt} DESC`)
        .limit(1);

      // JANGAN cancel order yang sudah dibayar — walau deadline sudah lewat
      // (race: customer bayar 08:59, scheduler jalan 09:00).
      if (payment && payment.status === 'PAID') return;

      const now = new Date();
      await tx
        .update(orders)
        .set({ status: 'CANCELLED', updatedAt: now })
        .where(eq(orders.id, orderId));

      if (payment) {
        await tx
          .update(payments)
          .set({ status: 'EXPIRED', updatedAt: now })
          .where(eq(payments.id, payment.id));
      }

      const deadline = new Date(lockedOrder.createdAt.getTime() + PAYMENT_EXPIRY_MS);
      this.logger.log(
        `[ORDER EXPIRATION] Order: #${lockedOrder.orderNumber ?? lockedOrder.id} | ` +
          `Payment deadline: ${deadline.toISOString()} | Status: ${payment?.status ?? 'PENDING'} | ` +
          `Action: AUTO CANCEL`,
      );
    });
  }
}