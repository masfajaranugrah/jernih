import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { productPromos, products } from '../../db/schema';
import { eq, and, desc, ilike, inArray, sql, asc } from 'drizzle-orm';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { buildPromo, computePromoStatus, isPromoActive, pickActivePromo } from './promo.helper';

type PromoFilter = {
  status?: 'active' | 'scheduled' | 'expired' | 'disabled' | 'all';
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'discount_desc' | 'newest';
  page?: number;
  limit?: number;
};

@Injectable()
export class PromosService {
  constructor(private readonly database: DatabaseService) {}

  /** Daftar promo + info produk untuk halaman /promo dan filter/sort/simpanan harga */
  async findAll(query: PromoFilter = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    // Muat semua row promo beserta produknya (relatif sedikit).
    const rows = await this.database.db.query.productPromos.findMany({
      with: {
        product: {
          columns: { id: true, name: true, slug: true, price: true, oldPrice: true, stock: true, images: true },
          with: { category: { columns: { id: true, name: true, slug: true } } },
        },
      },
    });

    const now = new Date();
    const enriched = rows
      .map((row: any) => {
        const promo = buildPromo(
          { ...row, normalPrice: Number(row.product?.price ?? 0) },
          now,
        );
        return {
          ...promo,
          product: row.product
            ? {
                id: row.product.id,
                name: row.product.name,
                slug: row.product.slug,
                price: String(row.product.price),
                oldPrice: row.product.oldPrice ? String(row.product.oldPrice) : null,
                stock: row.product.stock,
                images: Array.isArray(row.product.images) ? row.product.images.slice(0, 1) : [],
                category: row.product.category,
              }
            : null,
        };
      })
      .filter((p) => p.product);

    // Filter status
    let filtered = enriched;
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((p) => p.status === query.status);
    }
    // Search nama produk / judul promo
    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) => p.product.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q),
      );
    }

    // Sorting
    switch (query.sort) {
      case 'price_asc':
        filtered.sort((a, b) => Number(a.promoPrice) - Number(b.promoPrice));
        break;
      case 'price_desc':
        filtered.sort((a, b) => Number(b.promoPrice) - Number(a.promoPrice));
        break;
      case 'discount_desc':
        filtered.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      default:
        filtered.sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime());
    }

    const total = filtered.length;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Promo banner untuk homepage — ambil promo aktif (prioritas yang punya gambar banner, lalu yang paling cepat berakhir) */
  async findBanner() {
    const rows = await this.database.db.query.productPromos.findMany({
      with: {
        product: {
          columns: { id: true, name: true, slug: true, price: true, oldPrice: true, stock: true, images: true },
        },
      },
    });

    const now = new Date();
    const active = rows
      .filter((r: any) => isPromoActive(r, now))
      .map((row: any) => buildPromo({ ...row, normalPrice: Number(row.product?.price ?? 0) }, now));

    if (!active.length) return null;

    const withImage = active.filter((p) => p.bannerImage);
    const pool = withImage.length ? withImage : active;
    pool.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    return pool[0] ?? null;
  }

  async findOne(id: string) {
    const row = await this.database.db.query.productPromos.findFirst({
      where: eq(productPromos.id, id),
      with: {
        product: {
          columns: { id: true, name: true, slug: true, price: true, oldPrice: true, stock: true, images: true },
        },
      },
    });
    if (!row) throw new NotFoundException('Promo tidak ditemukan');
    const promo = buildPromo({ ...row, normalPrice: Number(row.product?.price ?? 0) });
    return {
      ...promo,
      product: row.product
        ? {
            id: row.product.id,
            name: row.product.name,
            slug: row.product.slug,
            price: String(row.product.price),
            oldPrice: row.product.oldPrice ? String(row.product.oldPrice) : null,
            stock: row.product.stock,
            images: Array.isArray(row.product.images) ? row.product.images.slice(0, 1) : [],
          }
        : null,
    };
  }

  async create(dto: CreatePromoDto) {
    const product = await this.database.db.query.products.findFirst({
      where: eq(products.id, dto.productId),
    });
    if (!product) throw new BadRequestException('Produk tidak ditemukan');

    const id = genId('promo');
    const normalPrice = Number(product.price);
    const discountPercent =
      dto.discountPercent !== undefined
        ? dto.discountPercent
        : normalPrice > Number(dto.promoPrice) && normalPrice > 0
          ? Math.round(((normalPrice - Number(dto.promoPrice)) / normalPrice) * 100)
          : 0;

    await this.database.db.insert(productPromos).values({
      id,
      productId: dto.productId,
      title: dto.title,
      subtitle: dto.subtitle ?? null,
      bannerImage: dto.bannerImage ?? null,
      bannerBg: dto.bannerBg ?? '#064e3b',
      promoPrice: String(dto.promoPrice),
      discountPercent: String(discountPercent),
      status: dto.status ?? 'ACTIVE',
      quota: dto.quota === null || dto.quota === undefined ? null : Math.floor(dto.quota),
      soldCount: 0,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });

    return this.findOne(id);
  }

  async update(id: string, dto: UpdatePromoDto) {
    const existing = await this.database.db.query.productPromos.findFirst({
      where: eq(productPromos.id, id),
    });
    if (!existing) throw new NotFoundException('Promo tidak ditemukan');

    const productId = dto.productId ?? existing.productId;
    const product = await this.database.db.query.products.findFirst({
      where: eq(products.id, productId),
    });
    if (!product) throw new BadRequestException('Produk tidak ditemukan');

    const promoPrice = dto.promoPrice !== undefined ? dto.promoPrice : Number(existing.promoPrice);
    let discountPercent = dto.discountPercent;
    if (discountPercent === undefined) {
      discountPercent =
        Number(product.price) > Number(promoPrice) && Number(product.price) > 0
          ? Math.round(((Number(product.price) - Number(promoPrice)) / Number(product.price)) * 100)
          : Number(existing.discountPercent ?? 0);
    }

    await this.database.db
      .update(productPromos)
      .set({
        ...(dto.productId ? { productId: dto.productId } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle } : {}),
        ...(dto.bannerImage !== undefined ? { bannerImage: dto.bannerImage } : {}),
        ...(dto.bannerBg !== undefined ? { bannerBg: dto.bannerBg } : {}),
        ...(dto.promoPrice !== undefined ? { promoPrice: String(dto.promoPrice) } : {}),
        discountPercent: String(discountPercent),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.quota !== undefined ? { quota: dto.quota === null ? null : Math.floor(dto.quota) } : {}),
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      } as any)
      .where(eq(productPromos.id, id));

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.database.db.delete(productPromos).where(eq(productPromos.id, id));
    return { message: 'Promo berhasil dihapus' };
  }
}