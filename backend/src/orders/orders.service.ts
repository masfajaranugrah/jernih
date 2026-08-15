import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { orders, orderItems, products, services, users, vouchers, voucherUses, chats } from '../../db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { MidtransService } from '../midtrans/midtrans.service';
import { getChannel, calculateFee } from '../midtrans/payment-methods';

@Injectable()
export class OrdersService {
  constructor(
    private readonly database: DatabaseService,
    private midtrans: MidtransService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const orderId = genId('ord');

    // Gunakan transaction untuk atomicity — stock, voucher, dan order all-or-nothing
    await this.database.db.transaction(async (tx) => {
      // Hitung subtotal dari items
      let subtotal = 0;
      const itemsData: any[] = [];

      // Muat semua produk & jasa sekali query per tipe (bukan SELECT per item).
      const productIds = dto.items.filter((i) => i.productId).map((i) => i.productId!);
      const serviceIds = dto.items.filter((i) => i.serviceId).map((i) => i.serviceId!);

      const [productsMap, servicesMap] = await Promise.all([
        productIds.length
          ? tx.select().from(products).where(inArray(products.id, productIds))
              .then((rows) => new Map(rows.map((r) => [r.id, r])))
          : Promise.resolve(new Map<string, any>()),
        serviceIds.length
          ? tx.select().from(services).where(inArray(services.id, serviceIds))
              .then((rows) => new Map(rows.map((r) => [r.id, r])))
          : Promise.resolve(new Map<string, any>()),
      ]);

      for (const item of dto.items) {
        let price = 0;
        let name = '';

        if (item.productId) {
          const product = productsMap.get(item.productId);
          if (!product) throw new NotFoundException(`Produk ${item.productId} tidak ditemukan`);

          const qty = item.quantity ?? 1;

          // Cek kecukupan stok
          if (Number(product.stock) < qty) {
            throw new BadRequestException(
              `Maaf, produk "${product.name}" saat ini stok habis.`,
            );
          }

          // Kurangi stok secara atomik
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${qty}` })
            .where(eq(products.id, item.productId));

          price = Number(product.price);
          name = product.name;
        } else if (item.serviceId) {
          const service = servicesMap.get(item.serviceId);
          if (!service) throw new NotFoundException(`Jasa ${item.serviceId} tidak ditemukan`);
          price = Number(service.priceFrom);
          name = service.name;
        } else if (item.name && item.price) {
          // Item dengan nama & harga custom (dari chat order) — tidak ada stok
          name = item.name;
          price = item.price;
        }

        const qty = item.quantity ?? 1;
        const itemSubtotal = price * qty;
        subtotal += itemSubtotal;

        itemsData.push({
          productId: item.productId,
          serviceId: item.serviceId,
          name,
          price,
          quantity: qty,
          subtotal: itemSubtotal,
        });
      }

      // Proses voucher jika ada
      let discountAmount = 0;
      let voucherUseId: string | undefined;

      if (dto.voucherCode) {
        const [voucher] = await tx.select().from(vouchers).where(eq(vouchers.code, dto.voucherCode));

        if (!voucher || !voucher.isActive || voucher.usedCount >= voucher.quota) {
          throw new BadRequestException('Voucher tidak valid atau sudah habis');
        }

        if (subtotal < Number(voucher.minPurchase)) {
          throw new BadRequestException(
            `Minimum pembelian Rp ${Number(voucher.minPurchase).toLocaleString('id-ID')} untuk menggunakan voucher ini`,
          );
        }

        if (voucher.type === 'PERCENTAGE') {
          discountAmount = (subtotal * Number(voucher.value)) / 100;
          if (voucher.maxDiscount) {
            discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
          }
        } else {
          discountAmount = Math.min(Number(voucher.value), subtotal);
        }

        // Buat VoucherUse + increment usedCount dalam 1 transaction
        const vUseId = genId('vu');
        await tx.insert(voucherUses).values({ id: vUseId, voucherId: voucher.id, userId });
        voucherUseId = vUseId;

        await tx
          .update(vouchers)
          .set({ usedCount: sql`${vouchers.usedCount} + 1` })
          .where(eq(vouchers.id, voucher.id));
      }

      const shippingCost = dto.shippingCost ?? 0;
      const total = subtotal - discountAmount + shippingCost;

      // Generate nomor pesanan 12 karakter alfanumerik — pake crypto aman
      const orderNumber = dto.orderNumber || (() => {
        const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
        return 'ORD-' + uuid.slice(0, 9);
      })();

      await tx.insert(orders).values({
        id: orderId,
        userId,
        orderNumber,
        addressId: dto.addressId ?? null,
        voucherUseId: voucherUseId ?? null,
        subtotal: String(subtotal),
        discountAmount: String(discountAmount),
        shippingCost: String(shippingCost),
        total: String(total),
        notes: dto.notes ?? null,
        paymentMethod: dto.paymentMethod ?? null,
      });

      if (itemsData.length) {
        await tx.insert(orderItems).values(
          itemsData.map((it) => ({ id: genId('oi'), orderId, ...it })),
        );
      }
    });

    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true, address: true },
    });
    return order;
  }

  async findAll(userId?: string, status?: string, page = 1, limit = 20) {
    const statuses = status
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const conditions = [
      ...(userId ? [eq(orders.userId, userId)] : []),
      ...(statuses?.length ? [inArray(orders.status, statuses as any)] : []),
    ];
    const where = conditions.length ? and(...conditions) : undefined;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.database.db.query.orders.findMany({
        where,
        with: {
          items: {
            with: {
              product: { columns: { id: true, name: true, images: true } },
              service: { columns: { id: true, name: true, images: true } },
            },
          },
          address: true,
          user: { columns: { id: true, name: true, email: true } },
        },
        orderBy: desc(orders.createdAt),
        limit,
        offset: skip,
      }),
      this.database.db.$count(orders, where),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, requesterId?: string, requesterRole?: string) {
    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, images: true } },
            service: { columns: { id: true, name: true, images: true } },
          },
        },
        address: true,
        user: { columns: { id: true, name: true, email: true, phone: true } },
        voucherUse: { with: { voucher: true } },
      },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // IDOR check: hanya pemilik order atau ADMIN yang boleh lihat
    if (requesterId && requesterRole !== 'ADMIN' && order.userId !== requesterId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const [existing] = await this.database.db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, id));
    if (!existing) throw new NotFoundException('Order tidak ditemukan');

    const [row] = await this.database.db
      .update(orders)
      .set({
        status: dto.status,
        ...(dto.status === 'SHIPPED' && {
          shippingCourier: dto.shippingCourier,
          trackingNumber: dto.trackingNumber,
        }),
        ...(dto.status === 'DELIVERED' && { paidAt: new Date() }),
      } as any)
      .where(eq(orders.id, id))
      .returning();
    return row;
  }

  /** Kirim bot message dari admin ke customer — pesan berbeda sesuai status */
  async sendBotMessage(orderId: string, customerId: string) {
    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // Cari admin aktif
    const [admin] = await this.database.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, 'ADMIN'), eq(users.isActive, true)))
      .limit(1);
    if (!admin) throw new NotFoundException('Admin tidak ditemukan');

    const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
    const itemSummary = order.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
    const totalFormatted = `Rp ${Number(order.total).toLocaleString('id-ID')}`;

    // Pilih pesan sesuai status
    let message: string;
    switch (order.status) {
      case 'PENDING':
        message = `✅ *Pesanan #${orderNumber}*\n\nTerima kasih sudah order! 🙏\n\nPesanan: ${itemSummary}\nTotal: ${totalFormatted}\n\nSilakan lakukan pembayaran ke salah satu rekening yang tertera di halaman pesanan. Jika sudah transfer, kirim bukti pembayaran di sini agar kami segera proses pesanan Anda.\n\n*Tim Jernih Creatife*`;
        break;

      case 'CONFIRMED':
      case 'PROCESSING':
        message = `📦 *Pesanan #${orderNumber}*\n\nMohon ditunggu, pesanan Anda sedang diproses oleh tim kami. Kami akan memberi tahu jika pesanan sudah dikirim.\n\nTerima kasih atas kesabaran Anda 🙏\n\n*Tim Jernih Creatife*`;
        break;

      case 'SHIPPED': {
        const courier = order.shippingCourier ? `Kurir: ${order.shippingCourier}` : '';
        const resi = order.trackingNumber ? `No. Resi: ${order.trackingNumber}` : '';
        const shippingInfo = [courier, resi].filter(Boolean).join('\n');
        message = `🚚 *Pesanan #${orderNumber}*\n\nPesanan Anda sudah dalam perjalanan!${shippingInfo ? `\n\n${shippingInfo}` : ''}\n\nSilakan cek halaman pesanan untuk update terbaru.\n\n*Tim Jernih Creatife*`;
        break;
      }

      case 'DELIVERED':
        message = `🎉 *Pesanan #${orderNumber}*\n\nPesanan Anda sudah terkirim! Terima kasih telah berbelanja di Jernih Creatife 🙏\n\nBantu kami dengan memberikan ulasan untuk produk yang Anda beli. Masukan Anda sangat berarti untuk kami.\n\nAda yang bisa kami bantu lagi? Silakan hubungi kami kapan saja.\n\n*Tim Jernih Creatife*`;
        break;

      case 'CANCELLED':
      case 'REFUNDED':
        message = `❌ *Pesanan #${orderNumber}*\n\nPesanan Anda telah dibatalkan. Jika ada pertanyaan silakan hubungi admin.\n\n*Tim Jernih Creatife*`;
        break;

      default:
        message = `📋 *Pesanan #${orderNumber}*\n\nStatus pesanan: ${order.status}. Silakan hubungi admin untuk informasi lebih lanjut.\n\n*Tim Jernih Creatife*`;
    }

    const chatId = genId('chat');
    await this.database.db.insert(chats).values({
      id: chatId,
      senderId: admin.id,
      receiverId: customerId,
      message,
      isSystem: true,
    });

    return { message: 'Bot message sent' };
  }

  /** Upload bukti pembayaran oleh customer */
  async uploadPayment(id: string, userId: string, paymentProof: string) {
    const [order] = await this.database.db.select().from(orders).where(eq(orders.id, id));
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order sudah tidak dalam status menunggu pembayaran');
    }

    const [row] = await this.database.db
      .update(orders)
      .set({
        paymentProof,
        status: 'CONFIRMED',
        paidAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return row;
  }

  /** Buat payment-intent Midtrans untuk order (hanya pemilik & status PENDING) */
  async createPaymentIntent(id: string, userId: string, paymentMethodId: string) {
    const channel = getChannel(paymentMethodId);
    if (!channel) {
      throw new BadRequestException('Metode pembayaran tidak valid');
    }

    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: true,
        user: { columns: { email: true, name: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order sudah tidak dalam status menunggu pembayaran');
    }

    // Hitung biaya admin Midtrans utk metode ini, tambahkan ke gross_amount
    const subtotal = Number(order.subtotal);
    const fee = calculateFee(paymentMethodId, subtotal);
    const totalAmount = Number(order.total) + fee;

    // Snap membutuhkan order_id unik — gunakan orderNumber (sudah unik)
    const { token, redirect_url } = await this.midtrans.createSnapToken(order as any, channel, fee);

    // Simpan snapToken + metode bayar + fee ke order utk resume bayar & tampilan detail
    await this.database.db
      .update(orders)
      .set({
        paymentMethod: paymentMethodId,
        snapToken: token,
        paymentFee: String(fee),
        midtransTransactionId: order.orderNumber ?? order.id.slice(0, 9).toUpperCase(),
      })
      .where(eq(orders.id, id));

    return { token, redirect_url, fee, totalAmount };
  }
}