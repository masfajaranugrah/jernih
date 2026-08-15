import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { heroBanners } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

@Injectable()
export class HeroService {
  constructor(private readonly database: DatabaseService) {}

  /** Ambil semua banner (urut position lalu updatedAt) */
  async findAll() {
    return this.database.db
      .select()
      .from(heroBanners)
      .orderBy(asc(heroBanners.position), asc(heroBanners.updatedAt));
  }

  /** Ambil banner berdasarkan ID */
  async findOne(id: string) {
    const [row] = await this.database.db.select().from(heroBanners).where(eq(heroBanners.id, id));
    if (!row) throw new NotFoundException(`Banner dengan ID ${id} tidak ditemukan`);
    return row;
  }

  /** Buat banner baru */
  async create(dto: UpdateHeroBannerDto) {
    const [row] = await this.database.db
      .insert(heroBanners)
      .values({
        id: genId('banner'),
        badge: dto.badge ?? '',
        title: dto.title ?? '',
        titleSuffix: dto.titleSuffix ?? '',
        subtitle: dto.subtitle ?? '',
        tagline: dto.tagline ?? '',
        description: dto.description ?? '',
        ctaText: dto.ctaText ?? '',
        ctaColor: dto.ctaColor ?? '',
        ctaTextColor: dto.ctaTextColor ?? '',
        bgColor: dto.bgColor ?? '#064e3b',
        imageUrl: dto.imageUrl ?? '',
        imageAlt: dto.imageAlt ?? '',
        linkHref: dto.linkHref ?? '',
        align: dto.align ?? 'left',
        isActive: dto.isActive ?? true,
        position: dto.position ?? 0,
      })
      .returning();
    return row;
  }

  /** Update banner berdasarkan ID */
  async update(id: string, dto: UpdateHeroBannerDto) {
    await this.findOne(id);
    const [row] = await this.database.db
      .update(heroBanners)
      .set(dto as any)
      .where(eq(heroBanners.id, id))
      .returning();
    return row;
  }

  /** Hapus banner berdasarkan ID */
  async delete(id: string) {
    await this.findOne(id);
    const [row] = await this.database.db
      .delete(heroBanners)
      .where(eq(heroBanners.id, id))
      .returning();
    return row;
  }

  /** Reset semua banner ke default */
  async resetAll() {
    await this.database.db.delete(heroBanners);
    return { message: 'Semua hero banner berhasil direset' };
  }
}