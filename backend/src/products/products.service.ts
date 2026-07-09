import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: dto,
      });
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException(
          'Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999',
        );
      }
      if (err?.code === 'P2002') {
        throw new BadRequestException('Slug produk sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async findAll(query?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      ...(query?.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query?.categoryId && { categoryId: query.categoryId }),
      ...(query?.minPrice !== undefined && !isNaN(Number(query.minPrice)) && {
        price: { gte: Number(query.minPrice) },
      }),
      ...(query?.maxPrice !== undefined && !isNaN(Number(query.maxPrice)) && {
        price: { lte: Number(query.maxPrice) },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    try {
      return await this.prisma.product.update({ where: { id }, data: dto });
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException(
          'Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999',
        );
      }
      if (err?.code === 'P2002') {
        throw new BadRequestException('Slug produk sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produk berhasil dihapus' };
  }
}
