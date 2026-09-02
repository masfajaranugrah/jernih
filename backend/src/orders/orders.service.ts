import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { ChatGateway } from '../chat/chat.gateway';
import { orders, orderItems, orderVouchers, products, services, users, vouchers, voucherUses, chats, payments, addresses, productReviews, productPromos, productTypes } from '../../db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderShippingDto } from './dto/update-order-shipping.dto';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';
import { MidtransService } from '../midtrans/midtrans.service';
import { ShippingService } from '../shipping/shipping.service';
import { getChannel, calculateFee, PAYMENT_METHODS } from '../midtrans/payment-methods';
import { VoucherException } from './voucher.exception';
import { pickActivePromo, buildPromo } from '../promos/promo.helper';

/** Batas pembayaran order = 24 jam sejak order dibuat */
export const PAYMENT_EXPIRY_MS = 24 * 60 * 60 * 1000;
export const RECEIVE_CONFIRM_DELAY_MS = 0;

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu pembayaran',
  CONFIRMED: 'Pembayaran berhasil',
  PROCESSING: 'Pesanan sedang diproses',
  SHIPPED: 'Pesanan sedang dikirim',
  DELIVERED: 'Pesanan telah diterima',
  CANCELLED: 'Pesanan dibatalkan',
  REFUNDED: 'Dana telah dikembalikan',
  EXPIRED: 'Pesanan dibatalkan',
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly database: DatabaseService,
    private midtrans: MidtransService,
    private readonly shipping: ShippingService,
  ) {}

  async create(userId: string, dto: CreateOrderDto, idempotencyKey?: string | null) {
    // ── Checkout idempotency ──────────────────────────────────────────────
    // Jika key yang sama pernah dipakai, kembalikan order yang sudah ada
    // (mencegah order ganda akibat double-click / network retry / refresh).
    if (idempotencyKey) {
      const existing = await this.database.db.query.orders.findFirst({
        where: and(eq(orders.userId, userId), eq(orders.idempotencyKey, idempotencyKey)),
        with: { items: true, address: true },
      });
      if (existing) return existing;
    }

    const orderId = genId('ord');

    try {
      // Gunakan transaction untuk atomicity — stock, voucher, dan order all-or-nothing
      await this.createOrderTx(userId, dto, orderId, idempotencyKey ?? null);
    } catch (e: any) {
      // Race: dua request dengan idempotency key sama masuk bersamaan → yang kalah
      // kena unique constraint. Kembalikan order yang sudah dibuat.
      if (idempotencyKey && this.isUniqueViolation(e)) {
        const existing = await this.database.db.query.orders.findFirst({
          where: and(eq(orders.userId, userId), eq(orders.idempotencyKey, idempotencyKey)),
          with: {
            items: {
              with: {
                product: { columns: { id: true, name: true, images: true } },
                service: { columns: { id: true, name: true, images: true } },
              },
            },
            address: true,
            orderVouchers: { with: { voucher: true } },
          },
        });
        if (existing) return existing;
      }
      throw e;
    }

    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, images: true } },
            service: { columns: { id: true, name: true, images: true } },
          },
        },
        address: true,
        orderVouchers: { with: { voucher: true } },
      },
    });
    return order;
  }

  /** Deteksi error unique constraint PostgreSQL (kode 23505) */
  private isUniqueViolation(e: any): boolean {
    return !!e && (e?.code === '23505' || e?.driverError?.code === '23505');
  }

  private async createOrderTx(
    userId: string,
    dto: CreateOrderDto,
    orderId: string,
    idempotencyKey: string | null,
  ) {
    await this.database.db.transaction(async (tx) => {
      // Hitung subtotal dari items
      let subtotal = 0;
      const itemsData: any[] = [];

      // Muat semua produk & jasa sekali query per tipe (bukan SELECT per item).
      const productIds = dto.items.filter((i) => i.productId).map((i) => i.productId!);
      const serviceIds = dto.items.filter((i) => i.serviceId).map((i) => i.serviceId!);

      const [productsMap, servicesMap, promosMap, typedProductIds] = await Promise.all([
        productIds.length
          ? tx.select().from(products).where(inArray(products.id, productIds))
              .then((rows) => new Map(rows.map((r) => [r.id, r])))
          : Promise.resolve(new Map<string, any>()),
        serviceIds.length
          ? tx.select().from(services).where(inArray(services.id, serviceIds))
              .then((rows) => new Map(rows.map((r) => [r.id, r])))
          : Promise.resolve(new Map<string, any>()),
        productIds.length
          ? tx.select().from(productPromos).where(inArray(productPromos.productId, productIds))
              .then((rows) => {
                const map = new Map<string, any[]>();
                for (const r of rows) {
                  const arr = map.get(r.productId) ?? [];
                  arr.push(r);
                  map.set(r.productId, arr);
                }
                return map;
              })
          : Promise.resolve(new Map<string, any[]>()),
        productIds.length
          ? tx.select({ productId: productTypes.productId }).from(productTypes)
              .where(and(inArray(productTypes.productId, productIds), eq(productTypes.isActive, true)))
              .then((rows) => new Set(rows.map((r) => r.productId)))
          : Promise.resolve(new Set<string>()),
      ]);

      const promoToIncrement = new Set<string>();

      for (const item of dto.items) {
        let price = 0;
        let name = '';

        if (item.productId) {
          const product = productsMap.get(item.productId);
          if (!product) throw new NotFoundException(`Produk ${item.productId} tidak ditemukan`);

          const qty = item.quantity ?? 1;

          // Cek kecukupan stok (tanpa mengurangi — stok baru dipotong saat pembayaran berhasil)
          if (Number(product.stock) < qty) {
            throw new BadRequestException(
              `Maaf, produk "${product.name}" saat ini stok habis.`,
            );
          }

          // ── Harga promo ───────────────────────────────────────────────
          // Jika produk punya promo aktif DAN tidak punya varian (tipe) aktif,
          // harga item = harga promo. Konsisten dengan logika frontend (produk
          // ber-tipe memakai harga tipe, bukan harga promo).
          const activePromo =
            !typedProductIds.has(item.productId)
              ? pickActivePromo(promosMap.get(item.productId) ?? [], new Date())
              : null;
          if (activePromo) {
            const quotaLeft =
              activePromo.quota === null
                ? null
                : Math.max(0, Number(activePromo.quota) - Number(activePromo.soldCount));
            if (quotaLeft !== null && quotaLeft < qty) {
              throw new BadRequestException(
                `Maaf, kuota promo "${activePromo.title}" tidak mencukupi untuk produk "${product.name}".`,
              );
            }
            price = Number(activePromo.promoPrice);
            promoToIncrement.add(activePromo.id);
          } else {
            price = Number(product.price);
          }
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

      // Proses voucher jika ada (kode voucher dari cart step / flow lama)
      let discountAmount = 0;
      let shippingDiscount = 0;
      let shippingCost = 0;

      if (dto.voucherCode) {
        const applied = await this.applyVoucherToOrderTx(
          tx,
          userId,
          orderId,
          subtotal,
          shippingCost,
          dto.voucherCode,
        );
        discountAmount = applied.productDiscount;
        shippingDiscount = applied.shippingDiscount;
      }

      // ── Ongkir ───────────────────────────────────────────────────────────
      // Jika customer mengirim addressId + courier + service, backend menghitung
      // ulang ongkir via RajaOngkir (TIDAK mempercayai shippingCost dari frontend).
      // Untuk order tanpa alamat (mis. order dari chat) fallback ke shippingCost.
      let shippingSnapshot: Record<string, string | null> = {};
      let shippingService = '';
      let shippingCourierCode = '';
      let shippingServiceDescription = '';
      let shippingEtd = '';

      if (dto.addressId && dto.shippingCourier && dto.shippingService) {
        const validated = await this.shipping.validateShipping(
          userId,
          dto.addressId,
          dto.shippingCourier,
          dto.shippingService,
        );
        shippingCost = validated.cost;
        shippingSnapshot = ShippingService.buildAddressSnapshot(validated.address);
        shippingCourierCode = validated.option.code;
        shippingService = validated.option.service;
        shippingServiceDescription = validated.option.description;
        shippingEtd = validated.option.etd;
      } else {
        shippingCost = dto.shippingCost ?? 0;
      }      const total = Math.max(0, subtotal - discountAmount + shippingCost - shippingDiscount);

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
        subtotal: String(subtotal),
        discountAmount: String(discountAmount),
        shippingDiscount: String(shippingDiscount),
        shippingCost: String(shippingCost),
        total: String(total),
        notes: dto.notes ?? null,
        paymentMethod: dto.paymentMethod ?? null,
        idempotencyKey,
        ...shippingSnapshot,
        ...(shippingCourierCode ? { shippingCourierCode } : {}),
        ...(shippingService ? { shippingService } : {}),
        ...(shippingServiceDescription ? { shippingServiceDescription } : {}),
        ...(shippingEtd ? { shippingEtd } : {}),
      });

      if (itemsData.length) {
        await tx.insert(orderItems).values(
          itemsData.map((it) => ({ id: genId('oi'), orderId, ...it })),
        );
      }

      // Naikkan jumlah promo yang terpakai (kuota promo berkurang)
      if (promoToIncrement.size) {
        await tx
          .update(productPromos)
          .set({
            soldCount: sql`${productPromos.soldCount} + ${promoToIncrement.size}`,
          })
          .where(inArray(productPromos.id, [...promoToIncrement]));
      }

      // Buat payment PENDING — sumber kebenaran status pembayaran.
      await tx.insert(payments).values({
        id: genId('pay'),
        orderId,
        provider: 'MIDTRANS',
        midtransOrderId: orderNumber,
        grossAmount: String(total),
        status: 'PENDING',
      });
    });
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

    // Query relasi memakai bentuk yang sudah teruji (tanpa limit/offset pada
    // query relasional ber-lateral). Pagination dihitung dari total + slicing
    // hasil — aman untuk semua versi drizzle dan menjamin produksi stabil.
    const [all, total] = await Promise.all([
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
          orderVouchers: { with: { voucher: true } },
        },
        orderBy: desc(orders.createdAt),
      }),
      this.database.db.$count(orders, where),
    ]);

    const data = all.slice((page - 1) * limit, page * limit);

    // Enrich list order utk countdown: paymentDeadline + status pembayaran
    // (satu query payments utk semua order di halaman ini).
    const orderIds = data.map((o) => o.id);
    const latestPaymentByOrder = new Map<string, { status: string; ts: number }>();
    if (orderIds.length) {
      const pays = await this.database.db
        .select({ orderId: payments.orderId, status: payments.status, createdAt: payments.createdAt })
        .from(payments)
        .where(inArray(payments.orderId, orderIds));
      for (const p of pays) {
        const ts = p.createdAt instanceof Date ? p.createdAt.getTime() : new Date(p.createdAt).getTime();
        const prev = latestPaymentByOrder.get(p.orderId);
        if (!prev || ts >= prev.ts) {
          latestPaymentByOrder.set(p.orderId, { status: p.status, ts });
        }
      }
    }

    const now = new Date();
    const enriched = data.map((o) => {
      const rawCreated = o.createdAt instanceof Date ? o.createdAt : o.createdAt ? new Date(o.createdAt) : null;
      const createdAt = rawCreated && !isNaN(rawCreated.getTime()) ? rawCreated : now;
      const paymentDeadline = new Date(createdAt.getTime() + PAYMENT_EXPIRY_MS);
      const paymentMethod = o.paymentMethod ?? null;
      const receiveMeta = this.buildReceiveMeta(o, now);
      return {
        ...o,
        ...receiveMeta,
        paymentDeadline: paymentDeadline.toISOString(),
        serverTime: now.toISOString(),
        payment: {
          status: latestPaymentByOrder.get(o.id)?.status ?? 'PENDING',
          method: paymentMethod,
          label: paymentMethod
            ? PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? paymentMethod
            : null,
        },
      };
    });

    return {
      data: enriched,
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
        orderVouchers: { with: { voucher: true } },
      },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // IDOR check: hanya pemilik order atau ADMIN yang boleh lihat
    if (requesterId && requesterRole !== 'ADMIN' && order.userId !== requesterId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }

    return this.enrichOrder(order);
  }

  /**
   * Lengkapi detail order utk halaman customer:
   * - paymentDeadline (createdAt + 24 jam, timezone Asia/Jakarta)
   * - serverTime (jam server — sumber kebenaran countdown frontend)
   * - payment { status, method, label } (status pembayaran dari tabel payments)
   * - summary { subtotal, productDiscount, shippingCost, shippingDiscount, grandTotal }
   */
  private async enrichOrder(order: any) {
    const [latestPayment] = await this.database.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(sql`${payments.createdAt} DESC`)
      .limit(1);

    const now = new Date();
    const rawCreated = order.createdAt instanceof Date ? order.createdAt : order.createdAt ? new Date(order.createdAt) : null;
    const createdAt = rawCreated && !isNaN(rawCreated.getTime()) ? rawCreated : now;
    const paymentDeadline = new Date(createdAt.getTime() + PAYMENT_EXPIRY_MS);

    const paymentMethod = order.paymentMethod ?? null;
    const methodLabel = paymentMethod
      ? PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? paymentMethod
      : null;
    const receiveMeta = this.buildReceiveMeta(order, now);

    return {
      ...order,
      ...receiveMeta,
      paymentDeadline: paymentDeadline.toISOString(),
      serverTime: now.toISOString(),
      payment: {
        status: (latestPayment?.status as string) ?? 'PENDING',
        method: paymentMethod,
        label: methodLabel,
      },
      summary: {
        subtotal: Number(order.subtotal ?? 0),
        productDiscount: Number(order.discountAmount ?? 0),
        shippingCost: Number(order.shippingCost ?? 0),
        shippingDiscount: Number(order.shippingDiscount ?? 0),
        grandTotal: Number(order.total ?? 0),
      },
    };
  }

  private buildReceiveMeta(order: any, now = new Date()) {
    const shippedAt = order.shippedAt instanceof Date ? order.shippedAt : order.shippedAt ? new Date(order.shippedAt) : null;
    const confirmReceivedAvailableAt = shippedAt
      ? new Date(shippedAt.getTime() + RECEIVE_CONFIRM_DELAY_MS)
      : null;
    return {
      confirmReceivedAvailableAt: confirmReceivedAvailableAt?.toISOString() ?? null,
      canConfirmReceived:
        order.status === 'SHIPPED' &&
        !!confirmReceivedAvailableAt &&
        now.getTime() >= confirmReceivedAvailableAt.getTime(),
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const [existing] = await this.database.db
      .select({ id: orders.id, userId: orders.userId, orderNumber: orders.orderNumber })
      .from(orders)
      .where(eq(orders.id, id));
    if (!existing) throw new NotFoundException('Order tidak ditemukan');
    if (dto.status === 'SHIPPED' && !dto.trackingNumber?.trim()) {
      throw new BadRequestException('Nomor seri/resi wajib diisi sebelum pesanan dikirim');
    }

    const shippedAt = dto.status === 'SHIPPED' ? new Date() : undefined;
    const [row] = await this.database.db
      .update(orders)
      .set({
        status: dto.status,
        ...(dto.status === 'SHIPPED' && {
          shippingCourier: dto.shippingCourier,
          trackingNumber: dto.trackingNumber,
          shippedAt,
        }),
        ...(dto.status === 'DELIVERED' && { receivedAt: new Date(), completedAt: new Date() }),
      } as any)
      .where(eq(orders.id, id))
      .returning();

    if (dto.status === 'SHIPPED') {
      await this.sendBotMessage(id, existing.userId);
    }

    // Broadcast perubahan status ke customer via WebSocket
    ChatGateway.instance?.emitOrderStatusUpdated({
      orderId: id,
      userId: existing.userId,
      status: dto.status,
      statusLabel: ORDER_STATUS_LABEL[dto.status] ?? dto.status,
      updatedAt: new Date().toISOString(),
    });

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
        const rawShippedAt = (order as any).shippedAt instanceof Date ? (order as any).shippedAt : (order as any).shippedAt ? new Date((order as any).shippedAt) : new Date();
        const availableAt = new Date(rawShippedAt.getTime() + RECEIVE_CONFIRM_DELAY_MS).toLocaleString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
        });
        message = `🚚 *Pesanan #${orderNumber}*\n\nPesanan Anda telah dikirim dan sedang dalam perjalanan.${shippingInfo ? `\n\n${shippingInfo}` : ''}\n\nAnda dapat melakukan konfirmasi penerimaan setelah ${availableAt} WIB.\n\n*Tim Jernih Creatife*`;
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

  async confirmReceived(id: string, userId: string, dto: ConfirmReceivedDto) {
    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    if (order.status !== 'SHIPPED') {
      throw new BadRequestException('Pesanan belum dalam status dikirim');
    }
    if (!order.shippedAt) {
      throw new BadRequestException('Waktu pengiriman belum tersimpan');
    }
    const availableAt = new Date(new Date(order.shippedAt).getTime() + RECEIVE_CONFIRM_DELAY_MS);
    if (Date.now() < availableAt.getTime()) {
      throw new BadRequestException(`Konfirmasi penerimaan dapat dilakukan setelah ${availableAt.toISOString()}`);
    }
    if (!dto.receivedProof?.trim()) {
      throw new BadRequestException('Bukti penerimaan wajib diupload');
    }

    const productItems = order.items.filter((item) => item.productId);
    if (!productItems.length) {
      throw new BadRequestException('Tidak ada produk yang dapat diulas pada pesanan ini');
    }

    const reviewByItem = new Map(dto.reviews.map((review) => [review.orderItemId, review]));
    for (const item of productItems) {
      const review = reviewByItem.get(item.id);
      if (!review) throw new BadRequestException(`Rating untuk ${item.name} wajib diisi`);
      if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        throw new BadRequestException(`Rating untuk ${item.name} harus 1 sampai 5`);
      }
      if ((review.comment ?? '').length > 1000) {
        throw new BadRequestException(`Ulasan untuk ${item.name} maksimal 1000 karakter`);
      }
    }

    await this.database.db.transaction(async (tx) => {
      const existingReviews = await tx
        .select({ orderItemId: productReviews.orderItemId })
        .from(productReviews)
        .where(inArray(productReviews.orderItemId, productItems.map((item) => item.id)));
      if (existingReviews.length) {
        throw new BadRequestException('Pesanan ini sudah pernah dikonfirmasi atau diulas');
      }

      await tx.insert(productReviews).values(
        productItems.map((item) => {
          const review = reviewByItem.get(item.id)!;
          return {
            id: genId('rev'),
            productId: item.productId!,
            userId,
            orderId: id,
            orderItemId: item.id,
            rating: review.rating,
            comment: review.comment?.trim() || null,
          };
        }),
      );

      const now = new Date();
      await tx
        .update(orders)
        .set({
          status: 'DELIVERED',
          receivedProof: dto.receivedProof,
          receivedAt: now,
          completedAt: now,
          updatedAt: now,
        } as any)
        .where(eq(orders.id, id));
    });

    await Promise.all([...new Set(productItems.map((item) => item.productId!))].map((productId) => this.recalculateProductRating(productId)));

    // Broadcast review baru ke semua pengunjung halaman produk (realtime)
    const reviewer = await this.database.db
      .select({ name: users.name, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0] ?? null);

    const receivedProofUrl = dto.receivedProof ?? null;

    for (const item of productItems) {
      const productId = item.productId!;
      const review = reviewByItem.get(item.id)!;

      const [countRow] = await this.database.db
        .select({
          avg: sql<string>`avg(${productReviews.rating})`,
          count: sql<string>`count(*)`,
        })
        .from(productReviews)
        .where(eq(productReviews.productId, productId));

      const newAvg = Number(countRow?.avg ?? 0);
      const newTotal = Number(countRow?.count ?? 0);

      // Cari id review yang baru saja diinsert
      const [inserted] = await this.database.db
        .select({ id: productReviews.id, createdAt: productReviews.createdAt })
        .from(productReviews)
        .where(
          and(
            eq(productReviews.productId, productId),
            eq(productReviews.orderItemId, item.id),
          ),
        )
        .limit(1);

      if (inserted) {
        ChatGateway.instance?.emitProductReviewNew({
          productId,
          review: {
            id: inserted.id,
            rating: review.rating,
            comment: review.comment?.trim() || null,
            userName: reviewer?.name ?? 'Pelanggan',
            userAvatar: reviewer?.avatar ?? null,
            image: receivedProofUrl,
            createdAt: inserted.createdAt instanceof Date
              ? inserted.createdAt.toISOString()
              : String(inserted.createdAt),
          },
          newAvgRating: newAvg,
          newTotalReviews: newTotal,
        });
      }
    }

    return this.findOne(id, userId);
  }

  private async recalculateProductRating(productId: string) {
    const [row] = await this.database.db
      .select({ avg: sql<string>`avg(${productReviews.rating})` })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    await this.database.db
      .update(products)
      .set({ rating: Number(row?.avg ?? 0), updatedAt: new Date() } as any)
      .where(eq(products.id, productId));
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

  /**
   * PATCH /orders/:id/shipping — simpan pilihan pengiriman customer.
   * Backend menghitung ulang ongkir via RajaOngkir + simpan snapshot alamat,
   * lalu update total order. Hanya boleh utk order milik user & status PENDING.
   */
  async updateShipping(id: string, userId: string, dto: UpdateOrderShippingDto) {
    const order = await this.database.db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order sudah tidak dalam status menunggu pembayaran');
    }

    const validated = await this.shipping.validateShipping(
      userId,
      dto.addressId,
      dto.courier,
      dto.service,
    );

    // Simpan pilihan pengiriman + snapshot alamat (total dihitung ulang setelahnya)
    await this.database.db
      .update(orders)
      .set({
        addressId: dto.addressId,
        shippingCost: String(validated.cost),
        shippingCourierCode: validated.option.code,
        shippingService: validated.option.service,
        shippingServiceDescription: validated.option.description,
        shippingEtd: validated.option.etd,
        ...ShippingService.buildAddressSnapshot(validated.address),
        updatedAt: new Date(),
      } as any)
      .where(eq(orders.id, id));

    // Hitung ulang diskon ongkir terhadap ongkir baru + total order
    await this.recomputeShippingVoucherDiscounts(id);
    await this.recalculateOrderTotals(id);

    const [row] = await this.database.db.select().from(orders).where(eq(orders.id, id));
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

    // ── Validasi ulang ongkir sebelum payment ──────────────────────────────
    // Jangan pernah mempercayai shippingCost dari frontend. Jika order punya
    // alamat, hitung ulang ongkir via RajaOngkir & samakan total order dengan
    // harga valid (customer tidak bisa mengubah request jadi ongkir Rp1).
    let effectiveTotal = Number(order.total);
    if (order.addressId) {
      if (!order.shippingCourierCode || !order.shippingService) {
        throw new BadRequestException(
          'Silakan pilih layanan pengiriman terlebih dahulu sebelum membayar',
        );
      }
      const validated = await this.shipping.validateShipping(
        userId,
        order.addressId,
        order.shippingCourierCode,
        order.shippingService,
      );
      await this.database.db
        .update(orders)
        .set({
          shippingCost: String(validated.cost),
          shippingServiceDescription: validated.option.description,
          shippingEtd: validated.option.etd,
          ...ShippingService.buildAddressSnapshot(validated.address),
          updatedAt: new Date(),
        } as any)
        .where(eq(orders.id, id));
    }

    // ── Validasi ulang voucher + hitung ulang diskon & total ──────────────
    // Voucher yang sudah tidak valid (expired/quota habis/nonaktif) akan
    // menolak pembayaran agar total di Midtrans selalu valid dari backend.
    await this.revalidateOrderVouchers(id);
    await this.recomputeShippingVoucherDiscounts(id);
    const totals = await this.recalculateOrderTotals(id);
    effectiveTotal = totals.total;

    // Hitung biaya admin Midtrans utk metode ini, tambahkan ke gross_amount
    const subtotal = Number(order.subtotal);
    const fee = calculateFee(paymentMethodId, subtotal);
    const totalAmount = effectiveTotal + fee;

    // Pastikan Midtrans memakai total yang sudah divalidasi (bukan yang basi)
    // Sinkronkan juga discountAmount & shippingDiscount agar item_details konsisten
    ;(order as any).total = String(effectiveTotal);
    ;(order as any).discountAmount = String(totals.productDiscount);
    ;(order as any).shippingDiscount = String(totals.shippingDiscount);

    // Snap membutuhkan order_id UNIK per transaksi — orderNumber tidak boleh
    // dipakai ulang (Midtrans menolak order_id yang pernah dibuat, walau belum
    // dibayar). Tambahkan suffix unik per percobaan bayar.
    const baseOrderId = order.orderNumber ?? order.id.slice(0, 9).toUpperCase();
    const attemptSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
    const midtransOrderId = `${baseOrderId}-${attemptSuffix}`;

    const { token, redirect_url } = await this.midtrans.createSnapToken(
      order as any,
      channel,
      fee,
      midtransOrderId,
    );

    // Simpan snapToken + metode bayar + fee ke order utk resume bayar & tampilan detail
    await this.database.db
      .update(orders)
      .set({
        paymentMethod: paymentMethodId,
        snapToken: token,
        paymentFee: String(fee),
        midtransTransactionId: midtransOrderId,
      })
      .where(eq(orders.id, id));

    // Perbarui/backfill payment row (source of truth status pembayaran)
    const [existingPayment] = await this.database.db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.orderId, id))
      .limit(1);

    if (existingPayment) {
      await this.database.db
        .update(payments)
        .set({
          midtransOrderId,
          paymentType: paymentMethodId,
          grossAmount: String(totalAmount),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await this.database.db.insert(payments).values({
        id: genId('pay'),
        orderId: id,
        provider: 'MIDTRANS',
        midtransOrderId,
        paymentType: paymentMethodId,
        grossAmount: String(totalAmount),
        status: 'PENDING',
      });
    }

    return { token, redirect_url, fee, totalAmount };
  }

  // ── Voucher (DISCOUNT produk & SHIPPING ongkir) ────────────────────────

  /**
   * Terapkan voucher ke order (PATCH/POST /orders/:id/vouchers).
   * Maksimal 1 voucher per kategori (DISCOUNT / SHIPPING). Backend adalah
   * sumber kebenaran: semua aturan divalidasi ulang di sini.
   */
  async applyVoucher(id: string, userId: string, voucherCode: string) {
    const [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order sudah tidak dalam status menunggu pembayaran');
    }

    await this.applyVoucherToOrderTx(
      this.database.db,
      userId,
      id,
      Number(order.subtotal),
      Number(order.shippingCost ?? 0),
      voucherCode,
    );
    await this.recalculateOrderTotals(id);
    return this.findOne(id, userId);
  }

  /** Hapus voucher dari order → hitung ulang total */
  async removeVoucher(id: string, userId: string, orderVoucherId: string) {
    const [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order sudah tidak dalam status menunggu pembayaran');
    }

    const [ov] = await this.database.db
      .select()
      .from(orderVouchers)
      .where(
        and(eq(orderVouchers.id, orderVoucherId), eq(orderVouchers.orderId, id)),
      );
    if (!ov) throw new NotFoundException('Voucher tidak ditemukan pada pesanan ini');

    await this.database.db.delete(orderVouchers).where(eq(orderVouchers.id, ov.id));
    await this.recalculateOrderTotals(id);
    return this.findOne(id, userId);
  }

  /**
   * Validasi + simpan voucher ke order dalam satu transaksi.
   * Dipakai oleh createOrderTx (flow kode voucher) & applyVoucher.
   */
  private async applyVoucherToOrderTx(
    tx: any,
    userId: string,
    orderId: string,
    subtotal: number,
    shippingCost: number,
    voucherCode: string,
  ) {
    const code = voucherCode.trim().toUpperCase();
    const [voucher] = await tx
      .select()
      .from(vouchers)
      .where(eq(vouchers.code, code));

    if (!voucher) throw new VoucherException('VOUCHER_NOT_FOUND', 'Voucher tidak ditemukan');
    if (!voucher.isActive) throw new VoucherException('VOUCHER_INACTIVE', 'Voucher sudah tidak aktif');
    if (voucher.startDate && new Date() < new Date(voucher.startDate)) {
      throw new VoucherException('VOUCHER_NOT_STARTED', 'Voucher belum berlaku');
    }
    if (voucher.endDate && new Date() > new Date(voucher.endDate)) {
      throw new VoucherException('VOUCHER_EXPIRED', 'Voucher sudah kedaluwarsa');
    }
    if (Number(voucher.usedCount) >= Number(voucher.quota)) {
      throw new VoucherException('VOUCHER_USAGE_LIMIT_REACHED', 'Kuota voucher sudah habis');
    }

    const category = voucher.category ?? 'DISCOUNT';

    if (subtotal < Number(voucher.minPurchase)) {
      throw new VoucherException(
        'MINIMUM_ORDER_NOT_MET',
        `Minimum pembelian Rp ${Number(voucher.minPurchase).toLocaleString('id-ID')} untuk menggunakan voucher ini`,
      );
    }

    // Maksimal 1 voucher per kategori pada satu order
    const existing = await tx
      .select()
      .from(orderVouchers)
      .where(eq(orderVouchers.orderId, orderId));
    if (existing.some((o) => o.voucherCategory === category)) {
      const msg =
        category === 'DISCOUNT'
          ? 'Anda sudah menggunakan voucher diskon produk. Maksimal 1 voucher diskon dapat digunakan.'
          : 'Anda sudah menggunakan voucher ongkir. Maksimal 1 voucher ongkir dapat digunakan.';
      throw new VoucherException('VOUCHER_TYPE_ALREADY_USED', msg);
    }

    // Satu user hanya boleh memakai voucher tertentu sekali — tetapi pemakaian
    // dicatat SAAT PEMBAYARAN BERHASIL (bukan saat apply). Jadi jika user
    // mengapply lalu menghapus / membatalkan order, voucher tetap tersedia.
    // Cek di sini hanya memblokir jika user SUDAH PERNAH BAYAR memakai voucher ini.
    const [used] = await tx
      .select()
      .from(voucherUses)
      .where(
        and(
          eq(voucherUses.voucherId, voucher.id),
          eq(voucherUses.userId, userId),
        ),
      );
    if (used) {
      throw new VoucherException('VOUCHER_ALREADY_USED', 'Anda sudah pernah menggunakan voucher ini');
    }

    const discount = this.computeVoucherDiscount(voucher, category, subtotal, shippingCost);

    await tx.insert(orderVouchers).values({
      id: genId('ov'),
      orderId,
      voucherId: voucher.id,
      voucherCode: voucher.code,
      voucherCategory: category,
      discountAmount: String(discount),
    });

    return {
      productDiscount: category === 'DISCOUNT' ? discount : 0,
      shippingDiscount: category === 'SHIPPING' ? discount : 0,
    };
  }

  /** Hitung nominal diskon voucher (produk vs ongkir), hormati batas maksimum */
  private computeVoucherDiscount(voucher: any, category: string, subtotal: number, shippingCost: number) {
    const base = category === 'SHIPPING' ? shippingCost : subtotal;
    let d = 0;
    if (voucher.type === 'PERCENTAGE') {
      d = (base * Number(voucher.value)) / 100;
      if (voucher.maxDiscount) d = Math.min(d, Number(voucher.maxDiscount));
    } else {
      d = Math.min(Number(voucher.value), base);
    }
    return Math.max(0, d);
  }

  /** Validasi voucher yang sudah terpasang di order (dipakai sebelum payment) */
  private async revalidateOrderVouchers(orderId: string) {
    const ovs = await this.database.db
      .select()
      .from(orderVouchers)
      .where(eq(orderVouchers.orderId, orderId));
    for (const ov of ovs) {
      const [v] = await this.database.db
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, ov.voucherId));
      if (!v) throw new VoucherException('VOUCHER_NOT_FOUND', 'Voucher tidak ditemukan');
      if (!v.isActive) throw new VoucherException('VOUCHER_INACTIVE', 'Voucher sudah tidak aktif');
      if (v.startDate && new Date() < new Date(v.startDate)) {
        throw new VoucherException('VOUCHER_NOT_STARTED', 'Voucher belum berlaku');
      }
      if (v.endDate && new Date() > new Date(v.endDate)) {
        throw new VoucherException('VOUCHER_EXPIRED', 'Voucher sudah kedaluwarsa');
      }
      // Kuota tidak dicek di sini: pemakaian dihitung saat pembayaran berhasil,
      // jadi order yg sudah memakai voucher tidak boleh diblokir saat bayar.
    }
  }

  /**
   * Hitung ulang diskon ongkir (SHIPPING) terhadap ongkir terkini.
   * Dipanggil saat ongkir berubah (updateShipping / createPaymentIntent) karena
   * nominal diskon ongkir bergantung pada shippingCost.
   */
  private async recomputeShippingVoucherDiscounts(orderId: string) {
    const [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) return;

    const shippingOvs = await this.database.db
      .select()
      .from(orderVouchers)
      .where(
        and(
          eq(orderVouchers.orderId, orderId),
          eq(orderVouchers.voucherCategory, 'SHIPPING'),
        ),
      );
    for (const ov of shippingOvs) {
      const [v] = await this.database.db
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, ov.voucherId));
      if (!v) continue;
      const d = this.computeVoucherDiscount(
        v,
        'SHIPPING',
        Number(order.subtotal),
        Number(order.shippingCost ?? 0),
      );
      await this.database.db
        .update(orderVouchers)
        .set({ discountAmount: String(d) })
        .where(eq(orderVouchers.id, ov.id));
    }
  }

  /**
   * Hitung ulang diskon produk/ongkir + total order dari order_vouchers.
   * Sumber kebenaran tunggal untuk total: subtotal − diskonProduk + ongkir − diskonOngkir.
   */
  private async recalculateOrderTotals(orderId: string) {
    const [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const ovs = await this.database.db
      .select()
      .from(orderVouchers)
      .where(eq(orderVouchers.orderId, orderId));

    const productDiscount = ovs
      .filter((o) => o.voucherCategory === 'DISCOUNT')
      .reduce((sum, o) => sum + Number(o.discountAmount), 0);
    const shippingDiscount = ovs
      .filter((o) => o.voucherCategory === 'SHIPPING')
      .reduce((sum, o) => sum + Number(o.discountAmount), 0);
    const total = Math.max(
      0,
      Number(order.subtotal) -
        productDiscount +
        Number(order.shippingCost ?? 0) -
        shippingDiscount,
    );

    await this.database.db
      .update(orders)
      .set({
        discountAmount: String(productDiscount),
        shippingDiscount: String(shippingDiscount),
        total: String(total),
        updatedAt: new Date(),
      } as any)
      .where(eq(orders.id, orderId));

    return { productDiscount, shippingDiscount, total };
  }
}
