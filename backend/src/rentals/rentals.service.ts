import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRentalDto) {
    const item = await this.prisma.rentalItem.findUnique({
      where: { id: dto.rentalItemId },
    });
    if (!item) throw new NotFoundException('Item sewa tidak ditemukan');

    const totalDays = Math.ceil(
      (new Date(dto.endDate).getTime() - new Date(dto.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const totalPrice = Number(item.pricePerDay) * totalDays;

    return this.prisma.rental.create({
      data: {
        userId,
        mitraId: item.mitraId ?? dto.mitraId,
        rentalItemId: dto.rentalItemId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalDays,
        totalPrice,
        notes: dto.notes,
      },
      include: { rentalItem: true },
    });
  }

  async findAll(userId?: string, mitraId?: string) {
    return this.prisma.rental.findMany({
      where: {
        ...(userId && { userId }),
        ...(mitraId && { mitraId }),
      },
      include: {
        rentalItem: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rental = await this.prisma.rental.findUnique({
      where: { id },
      include: {
        rentalItem: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        mitra: { select: { id: true, storeName: true } },
      },
    });
    if (!rental) throw new NotFoundException('Data sewa tidak ditemukan');
    return rental;
  }

  async update(id: string, dto: UpdateRentalDto) {
    await this.findOne(id);
    return this.prisma.rental.update({ where: { id }, data: dto });
  }

  // ── Rental Items ────────────────────────────────────────────────────────────
  async findAllItems(query?: { search?: string }) {
    return this.prisma.rentalItem.findMany({
      where: {
        isActive: true,
        ...(query?.search && {
          name: { contains: query.search, mode: 'insensitive' },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
