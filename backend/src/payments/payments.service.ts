// payments/payments.service.ts
// Service inti untuk pemrosesan pembayaran Midtrans yang production-ready:
// - verifikasi signature webhook (constant-time)
// - validasi order + gross amount
// - idempotency (unique constraint + status lock + webhook log)
// - database transaction (payment + order + stock atomik)
// - mapping status Midtrans → status internal
// - fallback status-check langsung ke Midtrans (recovery webhook telat)

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { MidtransService } from '../midtrans/midtrans.service';
import { ChatGateway } from '../chat/chat.gateway';
import {
  orders,
  payments,
  paymentWebhookLogs,
  orderItems,
  orderVouchers,
  vouchers,
  voucherUses,
  products,
} from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'AMOUNT_MISMATCH';

interface MidtransNotification {
  order_id?: string;
  status_code?: string | number;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  merchant_id?: string;
  settlement_time?: string;
  expiry_time?: string;
  [key: string]: unknown;
}

interface StatusMapping {
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  /** true jika stok harus dikurangi (pembayaran berhasil) */
  deductStock: boolean;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly midtrans: MidtransService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Webhook utama: POST /payments/midtrans/webhook
  // ─────────────────────────────────────────────────────────────────────────
  async processMidtransNotification(payload: MidtransNotification) {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      merchant_id,
    } = payload ?? {};

    // 1) Validasi minimal payload
    if (!order_id || !signature_key) {
      throw new UnauthorizedException('Missing signature');
    }

    // 1b) Notifikasi TEST dari dashboard Midtrans ("Test notification URL").
    // order_id test selalu diawali "payment_notif_test_..." dan TIDAK akan pernah
    // mencocokkan order nyata (format order asli "ORD-XXX-..."), jadi tidak ada
    // side-effect: alurnya tetap berlanjut ke lookup order → "Order not found" →
    // HTTP 200. Ini membuat tombol Test di dashboard berhasil tanpa melemahkan
    // keamanan notifikasi produksi (yang tetap wajib verifikasi signature).
    const isMidtransTest = String(order_id).startsWith('payment_notif_test_');

    // 2) Signature verification — constant-time, server key hanya di backend.
    // Hanya untuk notifikasi NYATA; notifikasi test dilewati (sesuai best practice
    // Midtrans: test notification tidak boleh membuat webhook gagal).
    if (!isMidtransTest) {
      const valid = this.midtrans.verifyNotification({
        order_id,
        status_code,
        gross_amount: gross_amount ?? '',
        signature_key,
      });
      if (!valid) {
        await this.logWebhook(payload, order_id, { error: 'invalid signature' });
        throw new UnauthorizedException('Invalid signature');
      }

      // 2b) Defense-in-depth: merchant ID harus sesuai konfigurasi
      const expectedMerchant = process.env.MIDTRANS_MERCHANT_ID;
      if (expectedMerchant && merchant_id && merchant_id !== expectedMerchant) {
        await this.logWebhook(payload, order_id, { error: 'merchant mismatch' });
        throw new UnauthorizedException('Merchant mismatch');
      }
    }

    const txId = transaction_id ?? order_id;
    const dedupKey = `MIDTRANS:${txId}:${transaction_status ?? 'unknown'}`;

    // 3) Catat webhook (audit) — ON CONFLICT DO NOTHING utk deteksi duplikat
    const logInsert = await this.database.db
      .insert(paymentWebhookLogs)
      .values({
        id: genId('pwl'),
        provider: 'MIDTRANS',
        eventType: transaction_status ?? null,
        orderId: null,
        transactionId: txId ?? null,
        transactionStatus: transaction_status ?? null,
        dedupKey,
        payload: payload as unknown as object,
        signature: signature_key ?? null,
        processed: false,
      })
      .onConflictDoNothing()
      .returning({ id: paymentWebhookLogs.id });
    const isDuplicateLog = logInsert.length === 0;

    // 4) Cari order. order_id Midtrans sekarang unik per percobaan bayar
    // (mis. "ORD-ABC-1a2b3c"), jadi petakan lewat payments.midtransOrderId.
    // Fallback ke orders.orderNumber utk transaksi legacy yang pakai orderNumber.
    let order: typeof orders.$inferSelect | undefined;
    const [payByMidtrans] = await this.database.db
      .select({ orderId: payments.orderId })
      .from(payments)
      .where(eq(payments.midtransOrderId, order_id))
      .limit(1);
    if (payByMidtrans) {
      [order] = await this.database.db
        .select()
        .from(orders)
        .where(eq(orders.id, payByMidtrans.orderId));
    } else {
      [order] = await this.database.db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, order_id));
    }
    if (!order) {
      // Acknowledge 200 + log, bukan 4xx — Midtrans menganggap non-2xx sebagai
      // kegagalan dan mereturnya terus. Ini juga membuat tombol "Test notification
      // URL" di dashboard Midtrans lolos (payload test memakai order_id dummy yang
      // tidak ada di database). Webhook untuk order tak dikenal tetap tercatat di log.
      await this.logWebhook(payload, order_id, { error: 'order not found', dedupKey });
      return { status_code: 200, message: 'Order not found' };
    }

    // 5) Validasi gross_amount — cegah tamper nominal.
    // Normalisasi: buang pemisah ribuan koma, pertahankan desimal titik
    // (Midtrans mengirim gross_amount seperti "204000.00" atau "204000").
    const expectedAmount = Number(order.total) + Number(order.paymentFee ?? 0);
    const notifiedAmount = Number(String(gross_amount ?? '').replace(/,/g, ''));
    const amountMismatch = Math.abs(expectedAmount - notifiedAmount) > 0.01;

    // 6) Pemrosesan idempotent + atomik
    return this.database.db.transaction(async (tx) => {
      // Lock order & payment row — serialisasi dua webhook yang bersamaan
      const [lockedOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, order.id))
        .for('update');
      if (!lockedOrder) throw new BadRequestException('Order tidak ditemukan');

      const paymentRows = await tx
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .for('update');
      let payment = paymentRows[0];

      // Pastikan selalu ada payment row (backfill untuk order legacy)
      if (!payment) {
        const inserted = await tx
          .insert(payments)
          .values({
            id: genId('pay'),
            orderId: order.id,
            provider: 'MIDTRANS',
            midtransOrderId: order_id,
            grossAmount: String(expectedAmount),
            status: 'PENDING',
          })
          .returning();
        payment = inserted[0];
      }

      // Idempotency: status terminal tidak boleh diproses ulang (double side-effect)
      if (this.isTerminalProcessed(payment.status as PaymentStatus)) {
        return { status_code: 200, message: 'Already processed', duplicate: true };
      }

      // 5b) Nominal tidak cocok → AMOUNT_MISMATCH + order CANCELLED.
      // Jangan proses order / kurangi stok / anggap berhasil. Catat di payment
      // (bukan throw) supaya Midtrans berhenti mengirim ulang & admin bisa review.
      if (amountMismatch) {
        await tx
          .update(payments)
          .set({
            status: 'AMOUNT_MISMATCH',
            grossAmount: String(notifiedAmount),
            rawResponse: payload as unknown as object,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));
        await tx
          .update(orders)
          .set({ status: 'CANCELLED', updatedAt: new Date() })
          .where(eq(orders.id, order.id));
        await this.markLogProcessed(dedupKey, order.id, { error: 'amount mismatch' });
        return { status_code: 200, message: 'Amount mismatch' };
      }

      const mapping = this.mapStatus(transaction_status ?? '', fraud_status, lockedOrder.status);
      const now = new Date();

      if (!mapping) {
        // Status tidak dikenal — hanya perbarui metadata payment
        await tx
          .update(payments)
          .set({
            transactionId: txId ?? payment.transactionId ?? null,
            paymentType: payment_type ?? payment.paymentType ?? null,
            fraudStatus: fraud_status ?? null,
            rawResponse: payload as unknown as object,
            updatedAt: now,
          })
          .where(eq(payments.id, payment.id));
        await this.markLogProcessed(dedupKey, order.id);
        return { status_code: 200, message: 'Notification processed' };
      }

      // Update payment
      await tx
        .update(payments)
        .set({
          transactionId: txId ?? payment.transactionId ?? null,
          paymentType: payment_type ?? payment.paymentType ?? null,
          status: mapping.paymentStatus,
          fraudStatus: fraud_status ?? null,
          grossAmount: String(notifiedAmount),
          signatureKey: signature_key ?? null,
          settlementTime:
            mapping.paymentStatus === 'PAID'
              ? new Date(now)
              : payment.settlementTime ?? null,
          rawResponse: payload as unknown as object,
          updatedAt: now,
        })
        .where(eq(payments.id, payment.id));

      // Update order
      await tx
        .update(orders)
        .set({
          status: mapping.orderStatus,
          paidAt: mapping.paymentStatus === 'PAID' ? now : lockedOrder.paidAt,
          paymentMethod: lockedOrder.paymentMethod ?? payment_type ?? null,
          midtransTransactionId: order_id ?? null,
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      // Stock: kurangi stok hanya saat pembayaran berhasil (PAID).
      // Stok tidak di-reserve saat checkout, jadi tidak ada yang dilepas
      // ketika order gagal/batal/expired.
      if (mapping.paymentStatus === 'PAID' && lockedOrder.status === 'PENDING') {
        await this.deductStock(tx, order.id);
        // Voucher baru "terpakai" saat pembayaran berhasil — dicatat di sini,
        // bukan saat apply. Voucher tetap tersedia sampai user benar-benar bayar.
        await this.recordVoucherUsage(tx, order.id, order.userId);
      }

      await this.markLogProcessed(dedupKey, order.id);

      // Realtime: beri tahu pemilik order → halaman detail auto-update
      this.chatGateway?.server
        .to(order.userId)
        .emit('order:status', { orderId: order.id, status: mapping.orderStatus });

      // Catat apakah ini duplikat dari sisi log (webhook retry) — tidak fatal
      return { status_code: 200, message: isDuplicateLog ? 'Duplicate webhook (already logged)' : 'Notification processed' };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status endpoint: GET /payments/:reference/status
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Ambil status pembayaran dari database (source of truth).
   * `reference` bisa berupa orderNumber ATAU midtransOrderId (order_id yang
   * dikirim Midtrans saat redirect ke Finish Redirect URL, bentuknya
   * "ORD-XXX-<suffix>"). Ini penting agar halaman /payment/success bisa
   * langsung memakai order_id dari URL Midtrans tanpa transformasi.
   */
  async getStatus(
    reference: string,
    requesterId?: string,
    requesterRole?: string,
  ) {
    let [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference));

    // Fallback: lookup via payments.midtransOrderId (order_id Midtrans unik per percobaan)
    if (!order) {
      const [pay] = await this.database.db
        .select({ orderId: payments.orderId })
        .from(payments)
        .where(eq(payments.midtransOrderId, reference))
        .limit(1);
      if (pay) {
        [order] = await this.database.db
          .select()
          .from(orders)
          .where(eq(orders.id, pay.orderId));
      }
    }

    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // IDOR check: hanya pemilik order atau ADMIN
    if (requesterId && requesterRole !== 'ADMIN' && order.userId !== requesterId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }

    const [payment] = await this.database.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(sql`${payments.createdAt} DESC`)
      .limit(1);

    let orderStatus = order.status as OrderStatus;
    let paymentStatus = (payment?.status as PaymentStatus) ?? 'PENDING';

    // Fallback recovery: jika webhook telat/gagal dan DB masih PENDING,
    // cek status langsung ke Midtrans (server key). Jangan polling terus.
    if (
      orderStatus === 'PENDING' &&
      paymentStatus === 'PENDING' &&
      order.midtransTransactionId
    ) {
      const synced = await this.syncFromMidtrans(order, payment);
      if (synced) {
        orderStatus = synced.orderStatus;
        paymentStatus = synced.paymentStatus;
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber ?? reference,
      orderStatus,
      paymentStatus,
    };
  }

  /** Fallback: tarik status dari Midtrans & terapkan jika berubah */
  private async syncFromMidtrans(
    order: typeof orders.$inferSelect,
    payment: typeof payments.$inferSelect | undefined,
  ): Promise<{ orderStatus: OrderStatus; paymentStatus: PaymentStatus } | null> {
    const orderId = order.midtransTransactionId ?? order.orderNumber;
    if (!orderId) return null;

    let data: any;
    try {
      data = await this.midtrans.getTransactionStatus(orderId);
    } catch {
      return null; // Midtrans tidak responsif — jangan gagalkan request
    }

    const txnStatus = data?.transaction_status;
    if (!txnStatus || txnStatus === 'pending') return null;

    // Terapkan lewat jalur yang sama (tanpa signature — ini response dari API
    // yang kita panggil sendiri via HTTPS + server key, bukan webhook publik).
    return this.database.db.transaction(async (tx) => {
      const [lockedOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, order.id))
        .for('update');
      const paymentRows = await tx
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .for('update');
      let pay = paymentRows[0] ?? payment;

      if (!pay) {
        const inserted = await tx
          .insert(payments)
          .values({
            id: genId('pay'),
            orderId: order.id,
            provider: 'MIDTRANS',
            midtransOrderId: orderId,
            grossAmount: String(Number(order.total) + Number(order.paymentFee ?? 0)),
            status: 'PENDING',
          })
          .returning();
        pay = inserted[0];
      }

      if (this.isTerminalProcessed(pay.status as PaymentStatus)) return null;

      const mapping = this.mapStatus(txnStatus, data?.fraud_status, lockedOrder.status);
      if (!mapping) return null;

      const now = new Date();
      await tx
        .update(payments)
        .set({
          transactionId: data?.transaction_id ?? pay.transactionId ?? null,
          paymentType: data?.payment_type ?? pay.paymentType ?? null,
          status: mapping.paymentStatus,
          fraudStatus: data?.fraud_status ?? null,
          grossAmount: String(data?.gross_amount ?? pay.grossAmount),
          settlementTime: mapping.paymentStatus === 'PAID' ? new Date(now) : pay.settlementTime ?? null,
          rawResponse: data ?? null,
          updatedAt: now,
        })
        .where(eq(payments.id, pay.id));

      await tx
        .update(orders)
        .set({
          status: mapping.orderStatus,
          paidAt: mapping.paymentStatus === 'PAID' ? now : lockedOrder.paidAt,
          paymentMethod: lockedOrder.paymentMethod ?? data?.payment_type ?? null,
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      if (mapping.paymentStatus === 'PAID' && lockedOrder.status === 'PENDING') {
        await this.deductStock(tx, order.id);
        await this.recordVoucherUsage(tx, order.id, order.userId);
      }

      this.chatGateway?.server
        .to(order.userId)
        .emit('order:status', { orderId: order.id, status: mapping.orderStatus });

      return { orderStatus: mapping.orderStatus, paymentStatus: mapping.paymentStatus };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Status terminal tidak boleh diproses ulang (idempotency + hindari side-effect ganda) */
  private isTerminalProcessed(currentStatus: PaymentStatus): boolean {
    return ['PAID', 'CANCELLED', 'EXPIRED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'AMOUNT_MISMATCH'].includes(
      currentStatus,
    );
  }

  /** Mapping status Midtrans → status internal payment & order */
  private mapStatus(
    transactionStatus: string,
    fraudStatus?: string,
    currentOrderStatus?: OrderStatus,
  ): StatusMapping | null {
    switch (transactionStatus) {
      case 'settlement':
        return { paymentStatus: 'PAID', orderStatus: 'CONFIRMED', deductStock: true };
      case 'capture':
        // Kartu kredit: challenge → belum PAID (tahan)
        if (fraudStatus === 'challenge') {
          return { paymentStatus: 'PENDING', orderStatus: 'PENDING', deductStock: false };
        }
        return { paymentStatus: 'PAID', orderStatus: 'CONFIRMED', deductStock: true };
      case 'pending':
        return { paymentStatus: 'PENDING', orderStatus: 'PENDING', deductStock: false };
      case 'deny':
      case 'failure':
        return { paymentStatus: 'FAILED', orderStatus: 'CANCELLED', deductStock: false };
      case 'cancel':
        return { paymentStatus: 'CANCELLED', orderStatus: 'CANCELLED', deductStock: false };
      case 'expire':
        return { paymentStatus: 'EXPIRED', orderStatus: 'CANCELLED', deductStock: false };
      case 'refund':
        return { paymentStatus: 'REFUNDED', orderStatus: 'REFUNDED', deductStock: false };
      case 'partial_refund':
        return {
          paymentStatus: 'PARTIALLY_REFUNDED',
          orderStatus: currentOrderStatus ?? 'REFUNDED',
          deductStock: false,
        };
      default:
        return null;
    }
  }

  /** Kurangi stok produk untuk item order — dipanggil saat pembayaran berhasil */
  private async deductStock(tx: any, orderId: string) {
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (item.productId) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
    }
  }

  /**
   * Catat pemakaian voucher saat pembayaran berhasil (PAID):
   * - buat VoucherUse (voucher_id, user_id) untuk penanda sekali pakai per user
   * - increment vouchers.usedCount untuk kuota
   * Dipanggil bersama deductStock, sehingga voucher "terpakai" hanya ketika
   * order benar-benar dibayar (bukan saat apply di halaman checkout).
   */
  private async recordVoucherUsage(tx: any, orderId: string, userId: string) {
    const ovs = await tx
      .select()
      .from(orderVouchers)
      .where(eq(orderVouchers.orderId, orderId));
    for (const ov of ovs) {
      await tx
        .insert(voucherUses)
        .values({ id: genId('vu'), voucherId: ov.voucherId, userId })
        .onConflictDoNothing();
      await tx
        .update(vouchers)
        .set({ usedCount: sql`${vouchers.usedCount} + 1` })
        .where(eq(vouchers.id, ov.voucherId));
    }
  }

  private async logWebhook(
    payload: MidtransNotification,
    orderId: string | undefined,
    extra: { error?: string; dedupKey?: string } = {},
  ) {
    const txId = payload.transaction_id ?? payload.order_id ?? null;
    const dedupKey = extra.dedupKey ?? `MIDTRANS:${txId}:${payload.transaction_status ?? 'unknown'}`;
    try {
      await this.database.db
        .insert(paymentWebhookLogs)
        .values({
          id: genId('pwl'),
          provider: 'MIDTRANS',
          eventType: payload.transaction_status ?? null,
          orderId: orderId ?? null,
          transactionId: txId,
          transactionStatus: payload.transaction_status ?? null,
          dedupKey,
          payload: payload as unknown as object,
          signature: payload.signature_key ?? null,
          processed: true,
          processedAt: new Date(),
          error: extra.error ?? null,
        })
        .onConflictDoNothing();
    } catch {
      // Logging tidak boleh menggagalkan request utama
    }
  }

  private async markLogProcessed(
    dedupKey: string,
    orderId: string,
    extra: { error?: string } = {},
  ) {
    try {
      await this.database.db
        .update(paymentWebhookLogs)
        .set({
          processed: true,
          processedAt: new Date(),
          orderId,
          error: extra.error ?? null,
        })
        .where(eq(paymentWebhookLogs.dedupKey, dedupKey));
    } catch {
      // abaikan
    }
  }
}
