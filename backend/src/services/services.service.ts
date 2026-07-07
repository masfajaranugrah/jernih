import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

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

  /**
   * Tambah jasa dari dashboard admin — otomatis cari/buat mitra admin.
   */
  async createFromAdmin(dto: CreateServiceDto & { mitraId?: string }) {
    if (dto.mitraId) {
      const { mitraId, ...serviceData } = dto;
      return this.create(mitraId, serviceData);
    }

    let mitra = await this.prisma.mitra.findFirst({
      where: { user: { role: 'ADMIN' } },
    });

    if (!mitra) {
      let adminUser = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (!adminUser) {
        adminUser = await this.prisma.user.create({
          data: {
            email: 'admin@eccomarket.id',
            password: 'hashed-placeholder',
            name: 'Admin Eccomarket',
            role: 'ADMIN',
          },
        });
      }
      mitra = await this.prisma.mitra.create({
        data: {
          userId: adminUser.id,
          storeName: 'Eccomarket Official',
          isVerified: true,
          isActive: true,
        },
      });
    }

    return this.create(mitra.id, dto);
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
