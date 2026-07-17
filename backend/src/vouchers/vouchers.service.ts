import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVoucherDto) {
    return this.prisma.voucher.create({ data: dto });
  }

  async findAll() {
    return this.prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Voucher yang bisa dipakai pelanggan: aktif, kuota tersisa, dalam periode berlaku.
   *  Sertakan flag `used` apakah user ini sudah pernah memakainya. */
  async findAvailable(userId: string) {
    const now = new Date();
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const uses = await this.prisma.voucherUse.findMany({
      where: { userId, voucherId: { in: vouchers.map((v) => v.id) } },
      select: { voucherId: true },
    });
    const usedIds = new Set(uses.map((u) => u.voucherId));

    return vouchers
      .filter((v) => v.usedCount < v.quota)
      .map((v) => ({ ...v, used: usedIds.has(v.id) }));
  }

  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher tidak ditemukan');
    return voucher;
  }

  async validate(code: string, userId: string, subtotal: number) {
    const voucher = await this.prisma.voucher.findUnique({ where: { code } });

    if (!voucher || !voucher.isActive) {
      throw new BadRequestException('Voucher tidak ditemukan atau tidak aktif');
    }
    if (voucher.usedCount >= voucher.quota) {
      throw new BadRequestException('Kuota voucher sudah habis');
    }
    if (subtotal < Number(voucher.minPurchase)) {
      throw new BadRequestException(
        `Minimum pembelian Rp ${voucher.minPurchase}`,
      );
    }
    if (voucher.startDate && new Date() < voucher.startDate) {
      throw new BadRequestException('Voucher belum berlaku');
    }
    if (voucher.endDate && new Date() > voucher.endDate) {
      throw new BadRequestException('Voucher sudah kadaluarsa');
    }

    // Cek apakah user sudah pernah pakai
    const alreadyUsed = await this.prisma.voucherUse.findUnique({
      where: { voucherId_userId: { voucherId: voucher.id, userId } },
    });
    if (alreadyUsed) {
      throw new BadRequestException('Anda sudah pernah menggunakan voucher ini');
    }

    let discount = 0;
    if (voucher.type === 'PERCENTAGE') {
      discount = (subtotal * Number(voucher.value)) / 100;
      if (voucher.maxDiscount) discount = Math.min(discount, Number(voucher.maxDiscount));
    } else {
      discount = Math.min(Number(voucher.value), subtotal);
    }

    return { voucher, discount };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.voucher.delete({ where: { id } });
    return { message: 'Voucher berhasil dihapus' };
  }
}
