// midtrans/midtrans.service.spec.ts
import { BadRequestException } from '@nestjs/common';
import { MidtransService } from './midtrans.service';

describe('MidtransService', () => {
  let service: MidtransService;

  const serverKey = 'Mid-server-test-key-1234567890';

  beforeEach(() => {
    process.env.MIDTRANS_SERVER_KEY = serverKey;
    process.env.MIDTRANS_IS_PRODUCTION = 'false';
    service = new MidtransService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.MIDTRANS_SERVER_KEY;
  });

  describe('verifyNotification', () => {
    // Helper: buat signature yang benar (SHA-512 biasa dari string gabungan, bukan HMAC)
    const createHash = require('crypto').createHash;
    const sign = (orderId: string, statusCode: string, gross: string, key: string) =>
      createHash('sha512').update(`${orderId}${statusCode}${gross}${key}`).digest('hex');

    it('menerima signature yang valid (constant-time)', () => {
      const payload = {
        order_id: 'ORD-ABC123',
        status_code: '200',
        gross_amount: '150000.00',
        signature_key: sign('ORD-ABC123', '200', '150000.00', serverKey),
      };
      expect(service.verifyNotification(payload)).toBe(true);
    });

    it('menolak signature yang invalid', () => {
      const payload = {
        order_id: 'ORD-ABC123',
        status_code: '200',
        gross_amount: '150000.00',
        signature_key: 'deadbeef'.repeat(16),
      };
      expect(service.verifyNotification(payload)).toBe(false);
    });

    it('menolak payload tanpa signature_key / order_id / gross_amount', () => {
      expect(service.verifyNotification({ order_id: '', status_code: '200', gross_amount: '0', signature_key: 'x' })).toBe(false);
      expect(service.verifyNotification({ order_id: 'ORD-1', status_code: '200', gross_amount: '0' } as any)).toBe(false);
    });
  });

  describe('createSnapToken', () => {
    const order = {
      id: 'ord_1',
      orderNumber: 'ORD-ABC123',
      total: '150000',
      items: [
        { id: 'prod_1', name: 'Produk A', price: '150000', quantity: 1 },
      ],
      user: { email: 'user@example.com', name: 'User', phone: '08123456789' },
    };

    it('berhasil membuat Snap token & redirect_url', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'snap-token-123', redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/transactions/snap-token-123' }),
      });
      (global as any).fetch = mockFetch;

      const result = await service.createSnapToken(order as any, 'bca_va', 4000);
      expect(result.token).toBe('snap-token-123');
      expect(result.redirect_url).toContain('snap-token-123');

      // order_id = orderNumber, gross_amount = total + fee
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/snap/v1/transactions');
      const body = JSON.parse(init.body);
      expect(body.transaction_details.order_id).toBe('ORD-ABC123');
      expect(body.transaction_details.gross_amount).toBe(154000);
      expect(body.enabled_payments).toEqual(['bca_va']);
      expect(init.headers.Authorization).toBe(`Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`);
    });

    it('menolak jika MIDTRANS_SERVER_KEY belum dikonfigurasi', async () => {
      delete process.env.MIDTRANS_SERVER_KEY;
      await expect(service.createSnapToken(order as any, 'bca_va', 0)).rejects.toThrow(BadRequestException);
    });

    it('membalikkan error saat API Midtrans gagal (Midtrans API failure)', async () => {
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ status_message: 'Access denied' }),
      });
      await expect(service.createSnapToken(order as any, 'bca_va', 0)).rejects.toThrow(BadRequestException);
    });

    it('item_details menyertakan diskon produk & ongkir agar sum = gross_amount', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'snap-token-123', redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/transactions/snap-token-123' }),
      });
      (global as any).fetch = mockFetch;

      const discountedOrder = {
        ...order,
        total: '128000', // subtotal 150000 + ongkir 6000 − diskon 25000 − diskonOngkir 3000
        shippingCost: '6000',
        discountAmount: '25000',
        shippingDiscount: '3000',
        items: [{ id: 'prod_1', name: 'Produk A', price: '150000', quantity: 1 }],
      };

      await service.createSnapToken(discountedOrder as any, 'bca_va', 0);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.transaction_details.gross_amount).toBe(128000);
      expect(body.item_details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'DISCOUNT-PRODUK', price: -25000, quantity: 1 }),
          expect.objectContaining({ id: 'DISCOUNT-ONGKIR', price: -3000, quantity: 1 }),
        ]),
      );
      // sum(item_details) === gross_amount
      const sum = body.item_details.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0);
      expect(sum).toBe(128000);
    });

    it('menolak saat Midtrans timeout', async () => {
      (global as any).fetch = jest.fn().mockRejectedValue({ name: 'AbortError' });
      await expect(service.createSnapToken(order as any, 'bca_va', 0)).rejects.toThrow('Midtrans timeout');
    });
  });

  describe('getTransactionStatus', () => {
    it('mengambil status transaksi dari Midtrans', async () => {
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transaction_status: 'settlement', fraud_status: 'accept', gross_amount: '154000.00' }),
      });
      const data = await service.getTransactionStatus('ORD-ABC123');
      expect(data.transaction_status).toBe('settlement');
    });

    it('membalikkan error saat Midtrans tidak responsif', async () => {
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ status_message: 'Transaction not found' }),
      });
      await expect(service.getTransactionStatus('ORD-XXX')).rejects.toThrow(BadRequestException);
    });
  });
});