import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { products, productTypes, productReviews } from '../../db/schema';
import { eq, and, or, ilike, gte, lte, desc, sql } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { buildPromo, pickActivePromo } from '../promos/promo.helper';

const PROMO_COLUMNS = {
  id: true,
  title: true,
  subtitle: true,
  bannerImage: true,
  bannerBg: true,
  promoPrice: true,
  discountPercent: true,
  status: true,
  quota: true,
  soldCount: true,
  startDate: true,
  endDate: true,
} as const;

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
            with: {
              category: { columns: { id: true, name: true, slug: true } },
              promos: { columns: PROMO_COLUMNS },
            },
            orderBy: desc(products.createdAt),
            limit,
            offset: skip,
          })
        : this.database.db.query.products.findMany({
            where,
            with: {
              category: { columns: { id: true, name: true, slug: true } },
              types: { where: eq(productTypes.isActive, true) },
              promos: { columns: PROMO_COLUMNS },
            },
            orderBy: desc(products.createdAt),
            limit,
            offset: skip,
          }),
      this.database.db.$count(products, where),
    ]);

    const now = new Date();
    // Kartu list hanya butuh gambar pertama — kirim maksimal 1 saja (light mode).
    const shaped = data.map((p: any) => {
      const promo = pickActivePromo(p.promos ?? [], now);
      const { promos, ...rest } = p;
      return {
        ...rest,
        images: query?.light
          ? Array.isArray(p.images)
            ? p.images.slice(0, 1)
            : []
          : Array.isArray(p.images)
            ? p.images
            : [],
        promo: promo ? buildPromo({ ...promo, normalPrice: Number(p.price ?? 0) }, now) : null,
      };
    });

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
        promos: { columns: PROMO_COLUMNS },
      },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return this.attachPromo(product as any);
  }

  async findBySlug(slug: string) {
    const product = await this.database.db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: {
        category: true,
        types: { where: eq(productTypes.isActive, true) },
        promos: { columns: PROMO_COLUMNS },
        reviews: {
          with: {
            user: { columns: { id: true, name: true, avatar: true } },
            order: { columns: { receivedProof: true } },
          },
          orderBy: (reviews: any, { desc }: any) => [desc(reviews.createdAt)],
        },
      },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    const shaped = this.attachPromo(product as any);
    if (Array.isArray(shaped.reviews)) {
      shaped.reviews = shaped.reviews.map((r: any) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        orderId: r.orderId,
        orderItemId: r.orderItemId,
        rating: r.rating,
        comment: r.comment,
        userName: r.user?.name ?? 'Pelanggan',
        userAvatar: r.user?.avatar ?? null,
        image: r.order?.receivedProof ?? null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    }
    return shaped;
  }

  /** Sisipkan objek `promo` (harga promo aktif) ke payload produk */
  private attachPromo(p: any) {
    const { promos, ...rest } = p;
    const promo = pickActivePromo(promos ?? []);
    return {
      ...rest,
      promo: promo ? buildPromo({ ...promo, normalPrice: Number(p.price ?? 0) }) : null,
    };
  }

  async findAllReviews({
    page = 1,
    limit = 20,
    search,
    rating,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
  }) {
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: any[] = [];
    if (rating) conditions.push(eq(productReviews.rating, Number(rating)));
    if (search) {
      conditions.push(
        or(
          ilike(productReviews.comment, `%${search}%`),
        ),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.database.db
      .select({ total: sql<string>`count(*)` })
      .from(productReviews)
      .where(where);

    const rows = await this.database.db.query.productReviews.findMany({
      where,
      with: {
        user: { columns: { id: true, name: true, avatar: true } },
        product: { columns: { id: true, name: true, slug: true } },
        order: { columns: { receivedProof: true } },
      },
      orderBy: (r: any, { desc }: any) => [desc(r.createdAt)],
      limit: Number(limit),
      offset,
    });

    return {
      data: rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user?.name ?? 'Pelanggan',
        userAvatar: r.user?.avatar ?? null,
        image: r.order?.receivedProof ?? null,
        productId: r.productId,
        productName: (r as any).product?.name ?? null,
        productSlug: (r as any).product?.slug ?? null,
        createdAt: r.createdAt,
      })),
      total: Number(total),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    };
  }

  async findReviews(productId: string) {
    const [avgRow] = await this.database.db
      .select({ avg: sql<string>`avg(${productReviews.rating})`, count: sql<string>`count(*)` })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));

    const reviews = await this.database.db.query.productReviews.findMany({
      where: eq(productReviews.productId, productId),
      with: {
        user: { columns: { id: true, name: true, avatar: true } },
        order: { columns: { receivedProof: true } },
      },
      orderBy: (r: any, { desc }: any) => [desc(r.createdAt)],
    });

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      breakdown[r.rating] = (breakdown[r.rating] ?? 0) + 1;
    }

    return {
      average: Number(avgRow?.avg ?? 0),
      total: Number(avgRow?.count ?? 0),
      breakdown,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user?.name ?? 'Pelanggan',
        userAvatar: r.user?.avatar ?? null,
        image: r.order?.receivedProof ?? null,
        createdAt: r.createdAt,
      })),
    };
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