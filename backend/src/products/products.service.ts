import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { products, productTypes } from '../../db/schema';
import { eq, and, or, ilike, gte, lte, desc } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateProductDto) {
    const { types, ...productData } = dto;
    try {
      const productId = genId('prod');
      await this.database.db.transaction(async (tx) => {
        await tx.insert(products).values({ id: productId, ...(productData as any) });
        if (types?.length) {
          await tx
            .insert(productTypes)
            .values(types.map((t) => ({ id: genId('pt'), productId, ...(t as any) })));
        }
      });
      const row = await this.database.db.query.products.findFirst({
        where: eq(products.id, productId),
        with: { types: true },
      });
      return row;
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException(
          'Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999',
        );
      }
      if (err?.code === '23505') {
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
    light?: boolean;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const conditions = [
      eq(products.isActive, true),
      ...(query?.search
        ? [or(ilike(products.name, `%${query.search}%`), ilike(products.description, `%${query.search}%`))]
        : []),
      ...(query?.categoryId ? [eq(products.categoryId, query.categoryId)] : []),
      ...(query?.minPrice !== undefined && !isNaN(Number(query.minPrice))
        ? [gte(products.price, String(query.minPrice))]
        : []),
      ...(query?.maxPrice !== undefined && !isNaN(Number(query.maxPrice))
        ? [lte(products.price, String(query.maxPrice))]
        : []),
    ];
    const where = conditions.length ? and(...conditions) : undefined;

    // Mode light: HANYA field untuk kartu list + slug + oldPrice + category.
    // Data lengkap baru diambil via GET /products/slug/:slug saat klik detail.
    const [data, total] = await Promise.all([
      query?.light
        ? this.database.db.query.products.findMany({
            where,
            columns: {
              id: true,
              name: true,
              slug: true,
              price: true,
              oldPrice: true,
              rating: true,
              totalSold: true,
              images: true,
            },
            with: { category: { columns: { id: true, name: true, slug: true } } },
            orderBy: desc(products.createdAt),
            limit,
            offset: skip,
          })
        : this.database.db.query.products.findMany({
            where,
            with: {
              category: { columns: { id: true, name: true, slug: true } },
              types: { where: eq(productTypes.isActive, true) },
            },
            orderBy: desc(products.createdAt),
            limit,
            offset: skip,
          }),
      this.database.db.$count(products, where),
    ]);

    // Kartu list hanya butuh gambar pertama — kirim maksimal 1 saja.
    const shaped = query?.light
      ? data.map((p: any) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images.slice(0, 1) : [],
        }))
      : data;

    return {
      data: shaped,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.database.db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        types: { where: eq(productTypes.isActive, true) },
      },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.database.db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: {
        category: true,
        types: { where: eq(productTypes.isActive, true) },
      },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { types, ...productData } = dto;
    console.log(`[BACKEND Product Update] ID: ${id}, Gambar yang diterima:`, dto.images);
    try {
      await this.database.db.transaction(async (tx) => {
        if (types !== undefined) {
          await tx.delete(productTypes).where(eq(productTypes.productId, id));
        }
        await tx.update(products).set(productData as any).where(eq(products.id, id));
        if (types?.length) {
          await tx
            .insert(productTypes)
            .values(types.map((t) => ({ id: genId('pt'), productId: id, ...(t as any) })));
        }
      });
      const updated = await this.database.db.query.products.findFirst({
        where: eq(products.id, id),
        with: { types: true },
      });
      console.log(`[BACKEND Product Update] Berhasil update produk ${id}. Gambar tersimpan di DB:`, updated?.images);
      return updated;
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException(
          'Harga yang dimasukkan terlalu besar. Maksimum harga adalah Rp 9.999.999.999',
        );
      }
      if (err?.code === '23505') {
        throw new BadRequestException('Slug produk sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.database.db.delete(products).where(eq(products.id, id));
    return { message: 'Produk berhasil dihapus' };
  }
}