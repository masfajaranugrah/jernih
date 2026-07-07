import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(mitraId: string, dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: { mitraId, ...dto },
      });
    } catch (err: any) {
      // PostgreSQL numeric overflow (code 22003)
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException(
          'Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999',
        );
      }
      // Slug duplicate (unique constraint)
      if (err?.code === 'P2002') {
        throw new BadRequestException('Slug produk sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  /**
   * Tambah produk dari dashboard admin.
   * Otomatis cari user ADMIN + mitra-nya. Kalau belum ada mitra, buat otomatis.
   */
  async createFromAdmin(dto: CreateProductDto & { mitraId?: string }) {
    // Kalau mitraId sudah dikirim langsung, pakai itu
    if (dto.mitraId) {
      const { mitraId, ...productData } = dto;
      return this.create(mitraId, productData);
    }

    // Cari user admin pertama yang punya mitra
    let mitra = await this.prisma.mitra.findFirst({
      where: { user: { role: 'ADMIN' } },
    });

    // Kalau belum ada, cari/buat user ADMIN dulu lalu buat mitranya
    if (!mitra) {
      let adminUser = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (!adminUser) {
        // Buat admin user default kalau belum ada
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

  async findAll(query?: {
    search?: string;
    categoryId?: string;
    mitraId?: string;
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
      ...(query?.mitraId && { mitraId: query.mitraId }),
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
          mitra: { select: { id: true, storeName: true, city: true } },
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
        mitra: { select: { id: true, storeName: true, logo: true, city: true, rating: true } },
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
        mitra: { select: { id: true, storeName: true, logo: true, city: true, rating: true } },
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
