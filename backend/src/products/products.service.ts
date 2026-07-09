import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  /**
   * mitraId mitra admin (Jernih Creatife Official Store).
   * Di-resolve SEKALI saat module init — tidak ada DB query ulang tiap request.
   *
   * Prioritas resolusi:
   *   1. env ADMIN_MITRA_ID  → langsung pakai, 0 DB query
   *   2. storeName lookup    → query 1x ke DB lalu cache di memory
   */
  private adminMitraId: string | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // ── Coba dari env dulu (zero DB query) ──────────────────────────────────
    const envId = process.env.ADMIN_MITRA_ID?.trim();
    if (envId) {
      this.adminMitraId = envId;
      this.logger.log(`✓ adminMitraId dari env: ${envId}`);
      return;
    }

    // ── Fallback: lookup sekali dari DB lalu tulis log supaya bisa copy-paste ─
    try {
      const mitra = await this.prisma.mitra.findFirst({
        where: { storeName: 'Eccomarket Official' },
        select: { id: true },
      });

      if (mitra) {
        this.adminMitraId = mitra.id;
        this.logger.warn(
          `ADMIN_MITRA_ID tidak ada di .env — ditemukan dari DB: "${mitra.id}". ` +
          `Tambahkan ADMIN_MITRA_ID=${mitra.id} ke backend/.env agar startup lebih cepat.`,
        );
      } else {
        this.logger.error(
          'Mitra "Eccomarket Official" tidak ditemukan di DB. ' +
          'Jalankan seed terlebih dahulu: cd backend && npx prisma db seed',
        );
      }
    } catch (err) {
      this.logger.error('Gagal lookup adminMitraId saat startup:', err);
    }
  }

  // ── Helper: ambil adminMitraId atau lempar error jelas ─────────────────────
  private getAdminMitraId(): string {
    if (!this.adminMitraId) {
      throw new InternalServerErrorException(
        'Mitra admin belum dikonfigurasi. Pastikan seed sudah dijalankan dan ' +
        'ADMIN_MITRA_ID ada di backend/.env.',
      );
    }
    return this.adminMitraId;
  }

  // ── create: simpan produk ke mitra manapun (dipakai internal) ──────────────
  async create(mitraId: string, dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: { mitraId, ...dto },
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

  /**
   * createForAdmin — dipakai oleh endpoint POST /products/admin.
   * Selalu pakai mitraId dari cache (Jernih Creatife Official Store).
   * Tidak ada DB query tambahan selain insert product itu sendiri.
   */
  async createForAdmin(dto: CreateProductDto) {
    const mitraId = this.getAdminMitraId();
    return this.create(mitraId, dto);
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
