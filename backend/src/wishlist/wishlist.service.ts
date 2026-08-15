import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { wishlists, products } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class WishlistService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.database.db.query.wishlists.findMany({
        where: eq(wishlists.userId, userId),
        with: {
          product: {
            with: {
              category: { columns: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: desc(wishlists.createdAt),
        limit,
        offset: skip,
      }),
      this.database.db.$count(wishlists, eq(wishlists.userId, userId)),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async count(userId: string) {
    return this.database.db.$count(wishlists, eq(wishlists.userId, userId));
  }

  async add(userId: string, productId: string) {
    if (!productId) throw new BadRequestException('productId wajib diisi');

    const [product] = await this.database.db.select().from(products).where(eq(products.id, productId));
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    // Upsert idempoten — index unik (userId, productId) menyingkirkan cek existing
    // yang sebelumnya memakan 1 query tambahan.
    await this.database.db
      .insert(wishlists)
      .values({ id: genId('wish'), userId, productId })
      .onConflictDoNothing({ target: [wishlists.userId, wishlists.productId] });

    const row = await this.database.db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)),
      with: { product: true },
    });
    return row;
  }

  async remove(userId: string, productId: string) {
    await this.database.db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return { message: 'Dihapus dari wishlist' };
  }
}