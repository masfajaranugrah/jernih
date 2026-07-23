import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';

@Injectable()
export class MitraService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMitraDto) {
    const existing = await this.prisma.mitra.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Akun mitra sudah terdaftar');

    return this.prisma.mitra.create({
      data: { userId, ...dto },
    });
  }

  async findAll(query?: { city?: string; isVerified?: boolean }) {
    return this.prisma.mitra.findMany({
      where: {
        isActive: true,
        ...(query?.city && { city: { contains: query.city, mode: 'insensitive' } }),
        ...(query?.isVerified !== undefined && { isVerified: query.isVerified }),
      },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        _count: { select: { services: true } },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findOne(id: string) {
    const mitra = await this.prisma.mitra.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        services: { where: { isActive: true }, take: 8 },
        _count: { select: { services: true, rentals: true } },
      },
    });
    if (!mitra) throw new NotFoundException('Mitra tidak ditemukan');
    return mitra;
  }

  async findByUser(userId: string) {
    return this.prisma.mitra.findUnique({
      where: { userId },
      include: {
        _count: { select: { services: true, rentals: true } },
      },
    });
  }

  async update(id: string, dto: UpdateMitraDto) {
    return this.prisma.mitra.update({ where: { id }, data: dto });
  }

  /** update dengan IDOR check — hanya pemilik mitra */
  async updateSafe(id: string, dto: UpdateMitraDto, userId: string) {
    const mitra = await this.findOne(id);
    if (mitra.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke mitra ini');
    }
    return this.prisma.mitra.update({ where: { id }, data: dto });
  }

  async verify(id: string) {
    return this.prisma.mitra.update({
      where: { id },
      data: { isVerified: true },
    });
  }
}
