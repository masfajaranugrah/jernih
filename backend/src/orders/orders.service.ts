import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Hitung subtotal dari items
    let subtotal = 0;
    const itemsData: any[] = [];

    for (const item of dto.items) {
      let price = 0;
      let name = '';

      if (item.productId) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Produk ${item.productId} tidak ditemukan`);
        price = Number(product.price);
        name = product.name;
      } else if (item.serviceId) {
        const service = await this.prisma.service.findUnique({ where: { id: item.serviceId } });
        if (!service) throw new NotFoundException(`Jasa ${item.serviceId} tidak ditemukan`);
        price = Number(service.priceFrom);
        name = service.name;
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
      const voucher = await this.prisma.voucher.findUnique({
        where: { code: dto.voucherCode },
      });

      if (!voucher || !voucher.isActive || voucher.usedCount >= voucher.quota) {
        throw new BadRequestException('Voucher tidak valid atau sudah habis');
      }

      if (subtotal < Number(voucher.minPurchase)) {
        throw new BadRequestException(
          `Minimum pembelian Rp ${voucher.minPurchase} untuk menggunakan voucher ini`,
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

      // Buat VoucherUse
      const voucherUse = await this.prisma.voucherUse.create({
        data: { voucherId: voucher.id, userId },
      });
      voucherUseId = voucherUse.id;

      // Increment usedCount
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const shippingCost = dto.shippingCost ?? 0;
    const total = subtotal - discountAmount + shippingCost;

    return this.prisma.order.create({
      data: {
        userId,
        addressId: dto.addressId,
        voucherUseId,
        subtotal,
        discountAmount,
        shippingCost,
        total,
        notes: dto.notes,
        paymentMethod: dto.paymentMethod,
        items: { create: itemsData },
      },
      include: { items: true, address: true },
    });
  }

  async findAll(userId?: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        ...(userId && { userId }),
        ...(status && { status: status as any }),
      },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            service: { select: { id: true, name: true, images: true } },
          },
        },
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        voucherUse: { include: { voucher: true } },
      },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === 'DELIVERED' && { paidAt: new Date() }),
      },
    });
  }
}
