import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { vouchers, voucherUses } from '../../db/schema';
import { eq, and, or, isNull, lte, gte, desc, inArray } from 'drizzle-orm';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateVoucherDto) {
    const [row] = await this.database.db
      .insert(vouchers)
      .values({
        id: genId('vch'),
        code: dto.code,
        description: dto.description ?? null,
        type: dto.type,
        value: String(dto.value),
        minPurchase: dto.minPurchase !== undefined ? String(dto.minPurchase) : '0',
        maxDiscount: dto.maxDiscount !== undefined ? String(dto.maxDiscount) : null,
        quota: dto.quota ?? 1,
        isActive: dto.isActive ?? true,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      })
      .returning();
    return row;
  }

  async findAll() {
    return this.database.db.select().from(vouchers).orderBy(desc(vouchers.createdAt));
  }

  /** Voucher yang bisa dipakai pelanggan: aktif, kuota tersisa, dalam periode berlaku.
   *  Sertakan flag `used` apakah user ini sudah pernah memakainya. */
  async findAvailable(userId: string) {
    const now = new Date();
    const list = await this.database.db
      .select()
      .from(vouchers)
      .where(
        and(
          eq(vouchers.isActive, true),
          or(isNull(vouchers.startDate), lte(vouchers.startDate, now)),
          or(isNull(vouchers.endDate), gte(vouchers.endDate, now)),
        ),
      )
      .orderBy(desc(vouchers.createdAt));

    const uses = await this.database.db
      .select({ voucherId: voucherUses.voucherId })
      .from(voucherUses)
      .where(
        and(
          eq(voucherUses.userId, userId),
          inArray(voucherUses.voucherId, list.map((v) => v.id)),
        ),
      );
    const usedIds = new Set(uses.map((u) => u.voucherId));

    return list
      .filter((v) => v.usedCount < v.quota)
      .map((v) => ({ ...v, used: usedIds.has(v.id) }));
  }

  async findOne(id: string) {
    const [voucher] = await this.database.db.select().from(vouchers).where(eq(vouchers.id, id));
    if (!voucher) throw new NotFoundException('Voucher tidak ditemukan');
    return voucher;
  }

  async validate(code: string, userId: string, subtotal: number) {
    const [voucher] = await this.database.db.select().from(vouchers).where(eq(vouchers.code, code));

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
    const [alreadyUsed] = await this.database.db
      .select()
      .from(voucherUses)
      .where(and(eq(voucherUses.voucherId, voucher.id), eq(voucherUses.userId, userId)));
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
    await this.database.db.delete(vouchers).where(eq(vouchers.id, id));
    return { message: 'Voucher berhasil dihapus' };
  }
}