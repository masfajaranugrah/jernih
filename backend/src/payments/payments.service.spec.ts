// payments/payments.service.spec.ts
import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PaymentsService } from './payments.service';
import { createMockDb } from '../test/mock-db';
import { orders, payments, paymentWebhookLogs, orderItems, orderVouchers, voucherUses, vouchers, products } from '../../db/schema';

describe('PaymentsService', () => {
  const serverKey = 'Mid-server-test-key-1234567890';

  const baseOrder = {
    id: 'ord_1',
    userId: 'user_1',
    orderNumber: 'ORD-ABC123',
    status: 'PENDING',
    subtotal: '200000',
    discountAmount: '0',
    shippingCost: '0',
    total: '200000',
    paymentFee: '4000',
    paidAt: null,
    midtransTransactionId: 'ORD-ABC123',
    paymentMethod: 'bca_va',
    snapToken: 'snap-1',
    notes: null,
    addressId: null,
    voucherUseId: null,
    paymentProof: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const basePayment = {
    id: 'pay_1',
    orderId: 'ord_1',
    provider: 'MIDTRANS',
    transactionId: null,
    midtransOrderId: 'ORD-ABC123',
    paymentType: 'bca_va',
    status: 'PENDING',
    fraudStatus: null,
    grossAmount: '204000',
    signatureKey: null,
    settlementTime: null,
    expiredAt: null,
    rawResponse: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sign = (orderId: string, statusCode: string, gross: string, key: string) =>
    createHash('sha512').update(`${orderId}${statusCode}${gross}${key}`).digest('hex');

  /** Payload webhook dengan signature valid (gross = 204000, total order + fee) */
  const makePayload = (overrides: Record<string, any> = {}) => {
    const payload: Record<string, any> = {
      order_id: 'ORD-ABC123',
      status_code: '200',
      gross_amount: '204000.00',
      transaction_status: 'settlement',
      fraud_status: 'accept',
      payment_type: 'bank_transfer',
      transaction_id: 'ORD-ABC123',
      ...overrides,
    };
    payload.signature_key = sign(payload.order_id, String(payload.status_code), payload.gross_amount, serverKey);
    return payload;
  };

  let service: PaymentsService;
  let mock: ReturnType<typeof createMockDb>;
  let midtransMock: { verifyNotification: jest.Mock; getTransactionStatus: jest.Mock };
  let chatMock: { server: { to: jest.Mock } };

  function setup(opts: {
    order?: any;
    payment?: any;
    productsRows?: any[];
    orderVouchersRows?: any[];
    txFail?: (table: any) => void;
    duplicateLog?: boolean;
  } = {}) {
    const order = 'order' in opts ? opts.order : baseOrder;
    const payment = 'payment' in opts ? opts.payment : basePayment;
    const productsRows = opts.productsRows ?? [];

    process.env.MIDTRANS_SERVER_KEY = serverKey;
    midtransMock = {
      verifyNotification: jest.fn().mockReturnValue(true),
      getTransactionStatus: jest.fn(),
    };
    chatMock = { server: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } };

    mock = createMockDb({
      // Webhook log insert (audit)
      insert: (table: any) => {
        if (table === paymentWebhookLogs) return opts.duplicateLog ? [] : [{ id: 'pwl_1' }];
        return [];
      },
      // Cari order by orderNumber
      select: (table: any) => {
        if (table === orders) return [order];
        if (table === payments) return payment ? [payment] : [];
        return [];
      },
      // markLogProcessed pakai db.update (bukan tx)
      update: (table: any) => (table === paymentWebhookLogs ? [{ id: 'pwl_1' }] : [{}]),
      // ── transaction ──
      txSelect: (table: any) => {
        if (table === orders) return [order];
        if (table === payments) return payment ? [payment] : [];
        if (table === orderItems) return [{ id: 'oi_1', orderId: order.id, productId: 'prod_1', quantity: 2 }];
        if (table === products) return productsRows;
        if (table === orderVouchers) return opts.orderVouchersRows ?? [];
        return [];
      },
      txInsert: (table: any) => {
        if (table === payments) return [{ ...basePayment, id: 'pay_new', status: 'PENDING' }];
        return [{ id: 'new' }];
      },
      txUpdate: (table: any) => {
        if (opts.txFail) opts.txFail(table);
        if (table === payments) return [{ ...payment, status: 'PAID' }];
        if (table === orders) return [{ ...order, status: 'CONFIRMED' }];
        if (table === products) return [{ ...productsRows[0] }];
        return [{}];
      },
    });

    service = new PaymentsService(
      { db: mock.db } as any,
      midtransMock as any,
      chatMock as any,
    );
  }

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.MIDTRANS_SERVER_KEY;
  });

  // ── Webhook: validasi ──────────────────────────────────────────────────
  it('7) webhook signature valid diproses', async () => {
    setup();
    const res = await service.processMidtransNotification(makePayload());
    expect(res.status_code).toBe(200);
    expect(midtransMock.verifyNotification).toHaveBeenCalled();
  });

  it('8) webhook signature invalid ditolak tanpa side-effect', async () => {
    setup();
    midtransMock.verifyNotification.mockReturnValue(false);
    await expect(service.processMidtransNotification(makePayload())).rejects.toThrow(UnauthorizedException);
    const orderUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === orders);
    expect(orderUpdate).toBeUndefined();
  });

  it('22) webhook order tidak ditemukan → di-ack 200 + dicatat, bukan error', async () => {
    setup({ order: undefined });
    const res = await service.processMidtransNotification(makePayload());
    expect(res.status_code).toBe(200);
    expect(res.message).toBe('Order not found');
    // Tidak ada update order/payment
    const orderUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === orders);
    expect(orderUpdate).toBeUndefined();
  });

  it('22b) notifikasi TEST Midtrans (order_id payment_notif_test_) diterima 200 tanpa verifikasi signature', async () => {
    setup({ order: undefined });
    midtransMock.verifyNotification.mockReturnValue(false); // buktikan signature dilewati
    const payload = makePayload({
      order_id: 'payment_notif_test_M646638862_ec9eb0d2-d654-43d6-9400-14a3f578be76',
    });
    payload.signature_key = 'signature_sengaja_salah';
    const res = await service.processMidtransNotification(payload);
    expect(res.status_code).toBe(200);
    expect(midtransMock.verifyNotification).not.toHaveBeenCalled();
    const orderUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === orders);
    expect(orderUpdate).toBeUndefined();
  });

  it('22c) notifikasi NYATA tetap wajib signature (bukan test) ditolak 401', async () => {
    setup();
    midtransMock.verifyNotification.mockReturnValue(false);
    await expect(
      service.processMidtransNotification(makePayload({ order_id: 'ORD-ABC123' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('9) gross amount cocok → diproses', async () => {
    setup();
    const res = await service.processMidtransNotification(makePayload());
    expect(res.status_code).toBe(200);
  });

  it('10) gross amount tidak cocok → payment AMOUNT_MISMATCH, order CANCELLED, tanpa kurangi stok', async () => {
    setup({ productsRows: [{ id: 'prod_1', stock: 5 }] });
    const payload = makePayload({ gross_amount: '10000.00' }); // ≠ 204000
    payload.signature_key = sign(payload.order_id, String(payload.status_code), payload.gross_amount, serverKey);
    const res = await service.processMidtransNotification(payload);
    expect(res.status_code).toBe(200);
    expect(res.message).toBe('Amount mismatch');
    expectTransition(makePayload(), 'AMOUNT_MISMATCH', 'CANCELLED');
    // Jangan proses order / kurangi stok
    const stockUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === products);
    expect(stockUpdate).toBeUndefined();
  });

  // ── Mapping status ─────────────────────────────────────────────────────
  function expectTransition(payload: any, paymentStatus: string, orderStatus: string) {
    const payUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === payments);
    const orderUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === orders);
    expect(payUpdate.payload.status).toBe(paymentStatus);
    expect(orderUpdate.payload.status).toBe(orderStatus);
  }

  it('11) settlement → payment PAID, order CONFIRMED (Dikemas), stok dikurangi', async () => {
    setup({ productsRows: [{ id: 'prod_1', stock: 5 }] });
    await service.processMidtransNotification(makePayload({ transaction_status: 'settlement' }));
    expectTransition(makePayload(), 'PAID', 'CONFIRMED');
    // Stok dikurangi saat pembayaran berhasil
    const stockUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === products);
    expect(stockUpdate).toBeDefined();
    // Realtime event ke pemilik order
    expect(chatMock.server.to).toHaveBeenCalledWith('user_1');
  });

  it('11b) settlement → voucher dicatat TERPAKAI (voucherUses + usedCount), bukan saat apply', async () => {
    setup({
      productsRows: [{ id: 'prod_1', stock: 5 }],
      orderVouchersRows: [
        { id: 'ov_1', orderId: 'ord_1', voucherId: 'vc_diskon', voucherCode: 'DISKON50', voucherCategory: 'DISCOUNT', discountAmount: '100000' },
      ],
    });
    await service.processMidtransNotification(makePayload({ transaction_status: 'settlement' }));

    // VoucherUse dibuat saat bayar berhasil
    const vuInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === voucherUses);
    expect(vuInsert).toBeDefined();
    expect(vuInsert.payload.voucherId).toBe('vc_diskon');
    expect(vuInsert.payload.userId).toBe('user_1');

    // usedCount voucher bertambah
    const usedUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === vouchers);
    expect(usedUpdate).toBeDefined();
  });

  it('11c) expire → voucher TIDAK dicatat terpakai (belum bayar)', async () => {
    setup({
      orderVouchersRows: [
        { id: 'ov_1', orderId: 'ord_1', voucherId: 'vc_diskon', voucherCode: 'DISKON50', voucherCategory: 'DISCOUNT', discountAmount: '100000' },
      ],
    });
    await service.processMidtransNotification(makePayload({ transaction_status: 'expire' }));
    const vuInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === voucherUses);
    expect(vuInsert).toBeUndefined();
  });

  it('12) pending → payment PENDING, order PENDING', async () => {
    setup();
    await service.processMidtransNotification(makePayload({ transaction_status: 'pending' }));
    expectTransition(makePayload(), 'PENDING', 'PENDING');
  });

  it('13) expire → payment EXPIRED, order CANCELLED, stok tidak diubah (tidak ada reservasi)', async () => {
    setup({ productsRows: [{ id: 'prod_1', stock: 3 }] });
    await service.processMidtransNotification(makePayload({ transaction_status: 'expire' }));
    expectTransition(makePayload(), 'EXPIRED', 'CANCELLED');
    const stockUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === products);
    expect(stockUpdate).toBeUndefined(); // stok tidak pernah di-reserve saat checkout
  });

  it('14) cancel → payment CANCELLED, order CANCELLED', async () => {
    setup();
    await service.processMidtransNotification(makePayload({ transaction_status: 'cancel' }));
    expectTransition(makePayload(), 'CANCELLED', 'CANCELLED');
  });

  it('14b) refund → payment REFUNDED, order REFUNDED', async () => {
    setup();
    await service.processMidtransNotification(makePayload({ transaction_status: 'refund' }));
    expectTransition(makePayload(), 'REFUNDED', 'REFUNDED');
  });

  it('14c) partial_refund → payment PARTIALLY_REFUNDED, order tetap', async () => {
    setup();
    await service.processMidtransNotification(makePayload({ transaction_status: 'partial_refund' }));
    const payUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === payments);
    expect(payUpdate.payload.status).toBe('PARTIALLY_REFUNDED');
  });

  it('15) deny → payment FAILED, order CANCELLED', async () => {
    setup();
    await service.processMidtransNotification(makePayload({ transaction_status: 'deny' }));
    expectTransition(makePayload(), 'FAILED', 'CANCELLED');
  });

  it('capture + fraud challenge → tetap PENDING (bukan PAID)', async () => {
    setup();
    await service.processMidtransNotification(makePayload({ transaction_status: 'capture', fraud_status: 'challenge' }));
    expectTransition(makePayload(), 'PENDING', 'PENDING');
  });

  // ── Idempotency & stock ───────────────────────────────────────────────
  it('16) duplicate webhook settlement → tidak ada side-effect ulang', async () => {
    setup({
      payment: { ...basePayment, status: 'PAID' }, // sudah PAID
      duplicateLog: true,
    });
    const res = await service.processMidtransNotification(makePayload());
    expect(res.message).toContain('Already processed');
    // Tidak ada order update baru
    const orderUpdate = mock.captured.filter((c) => c.op === 'txupdate' && c.table === orders);
    expect(orderUpdate.length).toBe(0);
  });

  it('18) settlement mengurangi stock persis sekali (idempotent saat duplikat)', async () => {
    setup({ productsRows: [{ id: 'prod_1', stock: 5 }] });
    // webhook #1 — settlement: stok dikurangi
    await service.processMidtransNotification(makePayload({ transaction_status: 'settlement' }));
    let stockUpdates = mock.captured.filter((c) => c.op === 'txupdate' && c.table === products);
    expect(stockUpdates).toHaveLength(1);

    // webhook #2 — duplicate settlement: payment sudah PAID → stop tanpa side-effect
    mock.captured.length = 0;
    setup({ payment: { ...basePayment, status: 'PAID' }, productsRows: [{ id: 'prod_1', stock: 5 }] });
    const second = await service.processMidtransNotification(makePayload({ transaction_status: 'settlement' }));
    expect(second.message).toContain('Already processed');
    stockUpdates = mock.captured.filter((c) => c.op === 'txupdate' && c.table === products);
    expect(stockUpdates).toHaveLength(0);
  });

  it('19) database rollback ketika satu operasi gagal di dalam transaction', async () => {
    setup({
      txFail: (table: any) => {
        if (table === orders) throw new Error('update orders gagal');
      },
    });
    await expect(service.processMidtransNotification(makePayload())).rejects.toThrow('update orders gagal');
  });

  // ── Status endpoint ───────────────────────────────────────────────────
  it('20) payment status endpoint mengembalikan status dari database', async () => {
    setup({
      order: { ...baseOrder, status: 'CONFIRMED', paidAt: new Date() },
      payment: { ...basePayment, status: 'PAID' },
    });
    const res = await service.getStatus('ORD-ABC123', 'user_1', 'CUSTOMER');
    expect(res.orderStatus).toBe('CONFIRMED');
    expect(res.paymentStatus).toBe('PAID');
  });

  it('20a) status endpoint mengembalikan orderId (untuk link Lihat Pesanan)', async () => {
    setup();
    const res = await service.getStatus('ORD-ABC123', 'user_1', 'CUSTOMER');
    expect(res.orderId).toBe('ord_1');
    expect(res.orderNumber).toBe('ORD-ABC123');
  });

  it('20b) status endpoint menolak akses user lain (IDOR)', async () => {
    setup();
    await expect(service.getStatus('ORD-ABC123', 'user_2', 'CUSTOMER')).rejects.toThrow(ForbiddenException);
  });

  it('20c) status endpoint fallback: cek ke Midtrans saat DB masih PENDING', async () => {
    setup();
    midtransMock.getTransactionStatus.mockResolvedValue({
      transaction_status: 'settlement',
      fraud_status: 'accept',
      payment_type: 'bank_transfer',
      gross_amount: '204000.00',
      transaction_id: 'ORD-ABC123',
    });
    const res = await service.getStatus('ORD-ABC123', 'user_1', 'CUSTOMER');
    expect(res.orderStatus).toBe('CONFIRMED');
    expect(res.paymentStatus).toBe('PAID');
    expect(midtransMock.getTransactionStatus).toHaveBeenCalledWith('ORD-ABC123');
  });
});