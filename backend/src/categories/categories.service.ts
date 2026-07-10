import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: { name: string; slug?: string; icon?: string }) {
    const slug = dto.slug || dto.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug,
          icon: dto.icon || null,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Nama atau slug kategori sudah digunakan.');
      }
      throw err;
    }
  }

  async findAll() {
    return await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  async update(id: string, dto: { name?: string; slug?: string; icon?: string }) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.name && !dto.slug) {
      data.slug = dto.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Nama atau slug kategori sudah digunakan.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (err: any) {
      throw new BadRequestException('Tidak dapat menghapus kategori karena masih digunakan oleh produk/jasa.');
    }
  }
}
