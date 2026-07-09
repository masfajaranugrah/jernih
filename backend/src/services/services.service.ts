import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Simpan jasa baru.
   * mitraId selalu datang dari caller — tidak ada lookup DB di sini.
   * Dipanggil dari:
   *   - POST /services/admin  → mitraId dari header X-Mitra-Id (cookie login)
   */
  async create(mitraId: string, dto: CreateServiceDto) {
    try {
      return await this.prisma.service.create({ data: { mitraId, ...dto } });
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException('Harga terlalu besar. Maksimum adalah Rp 9.999.999.999');
      }
      if (err?.code === 'P2002') {
        throw new BadRequestException('Slug jasa sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async findAll(query?: { search?: string; categoryId?: string; mitraId?: string }) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        ...(query?.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
        ...(query?.categoryId && { categoryId: query.categoryId }),
        ...(query?.mitraId && { mitraId: query.mitraId }),
      },
      include: {
        mitra: { select: { id: true, storeName: true, city: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        mitra: { select: { id: true, storeName: true, logo: true, city: true, rating: true } },
        category: true,
      },
    });
    if (!service) throw new NotFoundException('Jasa tidak ditemukan');
    return service;
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      include: {
        mitra: { select: { id: true, storeName: true, logo: true, city: true, rating: true } },
        category: true,
      },
    });
    if (!service) throw new NotFoundException('Jasa tidak ditemukan');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    try {
      return await this.prisma.service.update({ where: { id }, data: dto });
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException('Harga terlalu besar. Maksimum adalah Rp 9.999.999.999');
      }
      if (err?.code === 'P2002') {
        throw new BadRequestException('Slug jasa sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.service.delete({ where: { id } });
    return { message: 'Jasa berhasil dihapus' };
  }
}
