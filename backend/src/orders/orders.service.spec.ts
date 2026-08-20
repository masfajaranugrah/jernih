// orders/orders.service.spec.ts
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { createMockDb } from '../test/mock-db';
import { products, services, vouchers, orders, orderItems, payments, orderVouchers, voucherUses } from '../../db/schema';
import { VoucherException } from './voucher.exception';

describe('OrdersService', () => {
  let service: OrdersService;
  let mock: ReturnType<typeof createMockDb>;

  const dbProduct = {
    id: 'prod_1',
    name: 'Produk A',
    price: '100000',
    stock: 5,
    categoryId: null,
    oldPrice: null,
    description: null,
    images: null,
    isActive: true,
    rating: 0,
    totalSold: 0,
  };

  const createdOrder = {
    id: 'ord_1',
    orderNumber: 'ORD-ABC123',
    userId: 'user_1',
    status: 'PENDING',
    subtotal: '200000',
    discountAmount: '0',
    shippingCost: '0',
    total: '200000',
    items: [],
    address: null,
  };

  function setup(overrides: Partial<Parameters<typeof createMockDb>[0]> = {}) {
    mock = createMockDb({
      findFirst: () => createdOrder,
      txSelect: (table: any) => {
        if (table === products) return [dbProduct];
        if (table === services) return [];
        if (table === vouchers) return [];
        return [];
      },
      txUpdate: (table: any) => {
        if (table === products) return { ...dbProduct, stock: dbProduct.stock - 2 };
        return {};
      },
      txInsert: () => [{ id: 'new_row' }],
      ...overrides,
    });
    service = new OrdersService(
      { db: mock.db } as any,
      {} as any,
      { validateShipping: jest.fn() } as any,
    );
    return { service, mock };
  }

  it('1) create order berhasil dengan harga dari database', async () => {
    setup();
    const order = await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 2 }],
    });
    expect(order).toBeDefined();

    const orderInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orders);
    expect(orderInsert).toBeDefined();
    // subtotal = 100000 * 2 = 200000 — bukan dari frontend
    expect(orderInsert.payload.subtotal).toBe('200000');
    expect(orderInsert.payload.total).toBe('200000');

    // Payment PENDING harus dibuat
    const paymentInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === payments);
    expect(paymentInsert).toBeDefined();
    expect(paymentInsert.payload.status).toBe('PENDING');
    expect(paymentInsert.payload.grossAmount).toBe('200000');
  });

  it('2) create order gagal saat product tidak ditemukan', async () => {
    setup({
      txSelect: (table: any) => {
        if (table === products) return []; // produk tidak ada
        return [];
      },
    });
    await expect(service.create('user_1', { items: [{ productId: 'prod_1', quantity: 1 }] })).rejects.toThrow(NotFoundException);
  });

  it('3) create order gagal saat stock tidak cukup', async () => {
    setup({
      txSelect: (table: any) => {
        if (table === products) return [{ ...dbProduct, stock: 1 }]; // hanya stok 1, minta 2
        return [];
      },
    });
    await expect(service.create('user_1', { items: [{ productId: 'prod_1', quantity: 2 }] })).rejects.toThrow(BadRequestException);
  });

  it('3b) create order TIDAK mengurangi stok — stok dipotong saat pembayaran berhasil', async () => {
    setup();
    await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 2 }],
    });
    // Tidak boleh ada update stok produk saat checkout (belum bayar)
    const productUpdate = mock.captured.find((c) => c.op === 'txupdate' && c.table === products);
    expect(productUpdate).toBeUndefined();
  });

  it('4) harga frontend yang dimanipulasi diabaikan — pakai harga database', async () => {
    setup();
    const order = await service.create('user_1', {
      items: [{ productId: 'prod_1', price: 1, quantity: 1 }], // attacker mencoba harga 1
    });
    const orderInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orders);
    expect(orderInsert.payload.subtotal).toBe('100000'); // tetap harga DB
    expect(orderInsert.payload.total).toBe('100000');
    expect(order).toBeDefined();
  });

  it('5) grand total frontend yang dimanipulasi diabaikan — dihitung ulang backend', async () => {
    setup();
    await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 2 }],
      shippingCost: 5000, // legitimate — masuk perhitungan backend
    } as any);
    const orderInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orders);
    expect(orderInsert.payload.subtotal).toBe('200000');
    expect(orderInsert.payload.total).toBe('205000'); // 200000 + 5000
  });

  it('17) duplicate checkout dgn idempotency key yang sama → kembalikan order yang sama', async () => {
    // findFirst pertama (pre-check) mengembalikan order existing → tanpa membuat order baru
    const existing = { ...createdOrder, id: 'ord_existing' };
    setup({ findFirst: () => existing });

    const order = await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 2 }],
    }, 'idem-key-1');

    expect(order.id).toBe('ord_existing');
    // Tidak ada transaksi yang dijalankan (tidak ada insert order baru)
    const orderInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orders);
    expect(orderInsert).toBeUndefined();
  });

  it('17b) idempotency race: unique violation → kembalikan order yang sudah dibuat', async () => {
    // findFirst #1 (pre-check) tidak menemukan, insert kena unique constraint 23505,
    // lalu findFirst #2 (recovery) mengembalikan order yang sudah dibuat
    const uniqueViolation = new Error('duplicate key');
    (uniqueViolation as any).code = '23505';
    const existing = { ...createdOrder, id: 'ord_race' };
    let calls = 0;

    setup({
      findFirst: () => {
        calls += 1;
        return calls === 1 ? undefined : existing;
      },
      txInsert: () => { throw uniqueViolation; },
    });

    const order = await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 1 }],
    }, 'idem-key-2');
    expect(order.id).toBe('ord_race');
    expect(calls).toBe(2);
  });

  it('19) database rollback: error di dalam transaction menggagalkan create', async () => {
    setup({
      txInsert: (table: any) => {
        if (table === orders) throw new Error('insert orders gagal');
        return [{ id: 'new_row' }];
      },
    });
    await expect(
      service.create('user_1', { items: [{ productId: 'prod_1', quantity: 1 }] }),
    ).rejects.toThrow('insert orders gagal');
    // Error dari dalam transaction langsung dibuang (transaction tidak commit)
  });

  it('20) createPaymentIntent mengirim order_id unik per percobaan bayar', async () => {
    // order yang sama di-bayar 2x (retry setelah token pertama hang/expired)
    const midtrans = {
      createSnapToken: jest.fn().mockResolvedValue({ token: 'snap-1', redirect_url: 'https://snap/1' }),
    };
    mock = createMockDb({
      findFirst: () => ({
        ...createdOrder,
        items: [{ id: 'prod_1', name: 'Produk A', price: '100000', quantity: 2 }],
        user: { email: 'a@b.c', name: 'A', phone: '0812' },
      }),
      select: (table: any) =>
        table === orders
          ? [{ ...createdOrder, status: 'PENDING', subtotal: '200000', discountAmount: '0', shippingCost: '0', total: '200000' }]
          : [],
    });
    service = new OrdersService(
      { db: mock.db } as any,
      midtrans as any,
      { validateShipping: jest.fn() } as any,
    );

    await service.createPaymentIntent('ord_1', 'user_1', 'bca_va');
    await service.createPaymentIntent('ord_1', 'user_1', 'bca_va');

    const ids = midtrans.createSnapToken.mock.calls.map((c: any) => c[3]);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toMatch(/^ORD-ABC123-[0-9a-f]{6}$/);
    expect(ids[1]).toMatch(/^ORD-ABC123-[0-9a-f]{6}$/);
    // order_id kedua berbeda — Midtrans menolak order_id yang pernah dipakai
    expect(ids[0]).not.toBe(ids[1]);

    // payment row menyimpan order_id tiap attempt (untuk mapping webhook)
    const paymentInserts = mock.captured.filter((c) => c.op === 'insert' && c.table === payments);
    expect(paymentInserts.map((c) => c.payload.midtransOrderId)).toEqual([ids[0], ids[1]]);
  });

  it('22) create order dgn ongkir → backend hitung ulang, shippingCost frontend diabaikan', async () => {
    setup();
    (service as any).shipping.validateShipping.mockResolvedValue({
      cost: 18000,
      weight: 1000,
      address: {
        id: 'addr_1', userId: 'user_1', recipient: 'Fajar', phone: '0812',
        street: 'Jl. Contoh No. 10', city: 'Klaten', province: 'Jawa Tengah',
        postalCode: '57400', label: 'Rumah', isDefault: true,
      },
      option: { code: 'jne', name: 'JNE', service: 'REG', description: 'JNE REG', cost: 18000, etd: '2-4', note: '' },
    });

    await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 2 }],
      addressId: 'addr_1',
      shippingCourier: 'jne',
      shippingService: 'REG',
      shippingCost: 1, // attacker mencoba ongkir Rp1
    } as any);

    expect((service as any).shipping.validateShipping).toHaveBeenCalledWith(
      'user_1', 'addr_1', 'jne', 'REG',
    );
    const orderInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orders);
    expect(orderInsert.payload.shippingCost).toBe('18000'); // dihitung ulang, bukan Rp1
    expect(orderInsert.payload.total).toBe('218000'); // 200000 + 18000
    expect(orderInsert.payload.shippingName).toBe('Fajar'); // snapshot alamat tersimpan
    expect(orderInsert.payload.shippingService).toBe('REG');
    expect(orderInsert.payload.shippingCourierCode).toBe('jne');
  });

  it('23) updateShipping menyimpan ongkir valid + snapshot alamat', async () => {
    setup({
      findFirst: () => ({
        ...createdOrder,
        status: 'PENDING',
        subtotal: '200000',
        discountAmount: '0',
        shippingCost: '0',
        total: '200000',
        addressId: null,
      }),
      update: () => [{ id: 'ord_1', status: 'PENDING', total: '215000' }],
      select: (table: any) =>
        table === orders
          ? [{ ...createdOrder, status: 'PENDING', subtotal: '200000', discountAmount: '0', shippingCost: '15000', total: '200000' }]
          : [],
    });
    (service as any).shipping.validateShipping.mockResolvedValue({
      cost: 15000,
      weight: 1000,
      address: {
        id: 'addr_2', userId: 'user_1', recipient: 'Budi', phone: '0813',
        street: 'Jl. Pemuda No. 20', city: 'Klaten', province: 'Jawa Tengah',
        postalCode: '57412', label: 'Kantor', isDefault: false,
      },
      option: { code: 'jne', name: 'JNE', service: 'REG', description: 'JNE REG', cost: 15000, etd: '2-4', note: '' },
    });

    const res = await service.updateShipping('ord_1', 'user_1', {
      addressId: 'addr_2',
      courier: 'jne',
      service: 'REG',
    });

    expect(res).toBeDefined();
    const update = mock.captured.find((c) => c.op === 'update' && c.table === orders);
    expect(update).toBeDefined();
    expect(update.payload.shippingCost).toBe('15000');
    expect(update.payload.shippingCity).toBe('Klaten');
    // total dihitung ulang di update terpisah (recalculateOrderTotals): 200000 + 15000
    const totalUpdate = mock.captured.find(
      (c) => c.op === 'update' && c.table === orders && c.payload.total !== undefined,
    );
    expect(totalUpdate.payload.total).toBe('215000');
  });

  it('24) createPaymentIntent validasi ulang ongkir saat order punya alamat', async () => {
    const midtrans = {
      createSnapToken: jest.fn().mockResolvedValue({ token: 'snap-1', redirect_url: 'https://snap/1' }),
    };
    mock = createMockDb({
      findFirst: () => ({
        ...createdOrder,
        addressId: 'addr_1',
        shippingCourierCode: 'jne',
        shippingService: 'REG',
        shippingCost: '18000',
        total: '218000',
        items: [{ id: 'prod_1', name: 'Produk A', price: '100000', quantity: 2 }],
        user: { email: 'a@b.c', name: 'A', phone: '0812' },
      }),
      select: (table: any) =>
        table === orders
          ? [{ ...createdOrder, status: 'PENDING', subtotal: '200000', discountAmount: '0', shippingCost: '18000', total: '200000' }]
          : [],
    });
    const shippingMock = {
      validateShipping: jest.fn().mockResolvedValue({
        cost: 18000,
        address: {
          id: 'addr_1', userId: 'user_1', recipient: 'Fajar', phone: '0812',
          street: 'Jl. Contoh No. 10', city: 'Klaten', province: 'Jawa Tengah',
          postalCode: '57400', label: 'Rumah', isDefault: true,
        },
        option: { code: 'jne', name: 'JNE', service: 'REG', description: 'JNE REG', cost: 18000, etd: '2-4', note: '' },
      }),
    };
    service = new OrdersService({ db: mock.db } as any, midtrans as any, shippingMock as any);

    await service.createPaymentIntent('ord_1', 'user_1', 'bca_va');

    expect(shippingMock.validateShipping).toHaveBeenCalledWith('user_1', 'addr_1', 'jne', 'REG');
  });

  it('24b) createPaymentIntent menolak bayar saat order ber-alamat belum pilih pengiriman', async () => {
    const midtrans = {
      createSnapToken: jest.fn().mockResolvedValue({ token: 'snap-1', redirect_url: 'https://snap/1' }),
    };
    mock = createMockDb({
      findFirst: () => ({
        ...createdOrder,
        addressId: 'addr_1',
        shippingCourierCode: null,
        shippingService: null,
        shippingCost: '0',
        total: '200000',
      }),
      select: () => [],
    });
    service = new OrdersService(
      { db: mock.db } as any,
      midtrans as any,
      { validateShipping: jest.fn() } as any,
    );

    await expect(service.createPaymentIntent('ord_1', 'user_1', 'bca_va')).rejects.toThrow(
      BadRequestException,
    );
    expect(midtrans.createSnapToken).not.toHaveBeenCalled();
  });

  // ── Voucher: DISCOUNT produk & SHIPPING ongkir ─────────────────────────

  const orderRow = {
    id: 'ord_v',
    orderNumber: 'ORD-VC1',
    userId: 'user_1',
    status: 'PENDING',
    subtotal: '200000',
    discountAmount: '0',
    shippingDiscount: '0',
    shippingCost: '10000',
    total: '210000',
  };

  function voucherSetup(
    v: Partial<Record<string, any>> = {},
    opts: { used?: boolean; existingOv?: any[]; vouchersRows?: any[] } = {},
  ) {
    const voucherRow = {
      id: 'vc_diskon',
      code: 'DISKON50',
      name: 'Diskon 50%',
      description: '',
      category: 'DISCOUNT',
      type: 'PERCENTAGE',
      value: '50',
      minPurchase: '100000',
      maxDiscount: '250000',
      quota: 100,
      usedCount: 0,
      isActive: true,
      startDate: null,
      endDate: null,
      ...v,
    };
    let ovStore: any[] = opts.existingOv ?? [];
    mock = createMockDb({
      findFirst: () => ({ ...orderRow, items: [], address: null }),
      select: (table: any) => {
        if (table === orders) return [orderRow];
        if (table === vouchers) return opts.vouchersRows ?? [voucherRow];
        if (table === orderVouchers) return ovStore;
        if (table === voucherUses) return opts.used ? [{ id: 'vu_1' }] : [];
        return [];
      },
      insert: (table: any) => {
        if (table === orderVouchers) {
          // Simulasikan hasil insert: diskon yg dihitung backend utk subtotal 200000 / ongkir 10000
          const discount = voucherRow.category === 'SHIPPING' ? 5000 : 100000;
          ovStore = [
            ...ovStore,
            {
              id: 'ov_1',
              orderId: 'ord_v',
              voucherId: voucherRow.id,
              voucherCode: voucherRow.code,
              voucherCategory: voucherRow.category,
              discountAmount: String(discount),
            },
          ];
          return ovStore;
        }
        return [{ id: 'new' }];
      },
      delete: (table: any) => {
        if (table === orderVouchers) ovStore = [];
        return [];
      },
    });
    service = new OrdersService(
      { db: mock.db } as any,
      {} as any,
      { validateShipping: jest.fn() } as any,
    );
    return { service, mock };
  }

  it('25) applyVoucher DISCOUNT → diskon produk + total dihitung ulang', async () => {
    const { mock } = voucherSetup();
    await service.applyVoucher('ord_v', 'user_1', 'DISKON50');

    const ovInsert = mock.captured.find((c) => c.op === 'insert' && c.table === orderVouchers);
    expect(ovInsert).toBeDefined();
    expect(ovInsert.payload.voucherCode).toBe('DISKON50');
    expect(ovInsert.payload.voucherCategory).toBe('DISCOUNT');
    expect(ovInsert.payload.discountAmount).toBe('100000');

    const recalc = mock.captured.find(
      (c) => c.op === 'update' && c.table === orders && c.payload.total !== undefined,
    );
    expect(recalc.payload.discountAmount).toBe('100000');
    expect(recalc.payload.shippingDiscount).toBe('0');
    // 200000 − 100000 + 10000 = 110000
    expect(recalc.payload.total).toBe('110000');
  });

  it('26) applyVoucher SHIPPING → diskon ongkir + total dihitung ulang', async () => {
    const { mock } = voucherSetup({
      code: 'ONGKIR50',
      category: 'SHIPPING',
      value: '50',
      minPurchase: '50000',
      maxDiscount: '25000',
    });
    await service.applyVoucher('ord_v', 'user_1', 'ONGKIR50');

    const ovInsert = mock.captured.find((c) => c.op === 'insert' && c.table === orderVouchers);
    expect(ovInsert.payload.voucherCategory).toBe('SHIPPING');
    expect(ovInsert.payload.discountAmount).toBe('5000');

    const recalc = mock.captured.find(
      (c) => c.op === 'update' && c.table === orders && c.payload.total !== undefined,
    );
    expect(recalc.payload.discountAmount).toBe('0');
    expect(recalc.payload.shippingDiscount).toBe('5000');
    // 200000 + 10000 − 5000 = 205000
    expect(recalc.payload.total).toBe('205000');
  });

  it('27) voucher kedua dgn kategori sama → VOUCHER_TYPE_ALREADY_USED', async () => {
    const { service } = voucherSetup({}, {
      existingOv: [
        { id: 'ov_1', orderId: 'ord_v', voucherId: 'vc_old', voucherCode: 'OLD50', voucherCategory: 'DISCOUNT', discountAmount: '100000' },
      ],
    });
    await expect(service.applyVoucher('ord_v', 'user_1', 'DISKON50')).rejects.toThrow(
      expect.objectContaining({ response: expect.objectContaining({ code: 'VOUCHER_TYPE_ALREADY_USED' }) }),
    );
  });

  it('28) minPurchase tidak terpenuhi → MINIMUM_ORDER_NOT_MET', async () => {
    const { service } = voucherSetup({ minPurchase: '500000' });
    await expect(service.applyVoucher('ord_v', 'user_1', 'DISKON50')).rejects.toThrow(
      expect.objectContaining({ response: expect.objectContaining({ code: 'MINIMUM_ORDER_NOT_MET' }) }),
    );
  });

  it('28b) voucher tidak ditemukan → VOUCHER_NOT_FOUND', async () => {
    const { service } = voucherSetup({ code: 'LAINNYA' }, { vouchersRows: [] });
    await expect(service.applyVoucher('ord_v', 'user_1', 'DISKON50')).rejects.toThrow(
      expect.objectContaining({ response: expect.objectContaining({ code: 'VOUCHER_NOT_FOUND' }) }),
    );
  });

  it('28c) voucher sudah dipakai user → VOUCHER_ALREADY_USED', async () => {
    const { service } = voucherSetup({}, { used: true });
    await expect(service.applyVoucher('ord_v', 'user_1', 'DISKON50')).rejects.toThrow(
      expect.objectContaining({ response: expect.objectContaining({ code: 'VOUCHER_ALREADY_USED' }) }),
    );
  });

  it('29) removeVoucher → order_vouchers dihapus + total kembali normal', async () => {
    const { mock } = voucherSetup({}, {
      existingOv: [
        { id: 'ov_1', orderId: 'ord_v', voucherId: 'vc_diskon', voucherCode: 'DISKON50', voucherCategory: 'DISCOUNT', discountAmount: '100000' },
      ],
    });
    await service.removeVoucher('ord_v', 'user_1', 'ov_1');

    const del = mock.captured.find((c) => c.op === 'delete' && c.table === orderVouchers);
    expect(del).toBeDefined();

    const recalc = mock.captured.find(
      (c) => c.op === 'update' && c.table === orders && c.payload.total !== undefined,
    );
    expect(recalc.payload.discountAmount).toBe('0');
    // 200000 + 10000 = 210000
    expect(recalc.payload.total).toBe('210000');
  });

  it('30) applyVoucher pada order yg bukan milik user → Forbidden', async () => {
    const { service } = voucherSetup();
    await expect(service.applyVoucher('ord_v', 'user_2', 'DISKON50')).rejects.toThrow('tidak memiliki akses');
  });

  it('31) create dgn voucherCode → order_vouchers tersimpan + total terpotong', async () => {
    // tx path: voucher tersedia di database, dipakai saat create order
    mock = createMockDb({
      findFirst: () => undefined,
      txSelect: (table: any) => {
        if (table === products) return [dbProduct];
        if (table === vouchers) return [{
          id: 'vc_diskon', code: 'DISKON50', name: 'Diskon 50%', description: '',
          category: 'DISCOUNT', type: 'PERCENTAGE', value: '50',
          minPurchase: '100000', maxDiscount: '250000',
          quota: 100, usedCount: 0, isActive: true, startDate: null, endDate: null,
        }];
        return [];
      },
      txInsert: (table: any) => {
        if (table === orderVouchers) {
          return [{ id: 'ov_1', orderId: 'ord_1', voucherId: 'vc_diskon', voucherCode: 'DISKON50', voucherCategory: 'DISCOUNT', discountAmount: '100000' }];
        }
        return [{ id: 'new' }];
      },
    });
    service = new OrdersService(
      { db: mock.db } as any,
      {} as any,
      { validateShipping: jest.fn() } as any,
    );

    await service.create('user_1', {
      items: [{ productId: 'prod_1', quantity: 2 }], // subtotal 200000
      voucherCode: 'DISKON50',
    } as any);

    const ovInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orderVouchers);
    expect(ovInsert).toBeDefined();
    expect(ovInsert.payload.voucherCode).toBe('DISKON50');
    expect(ovInsert.payload.voucherCategory).toBe('DISCOUNT');

    const orderInsert = mock.captured.find((c) => c.op === 'txinsert' && c.table === orders);
    // 200000 − 100000 = 100000
    expect(orderInsert.payload.discountAmount).toBe('100000');
    expect(orderInsert.payload.total).toBe('100000');
  });
});