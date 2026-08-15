import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { categories } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CategoriesService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: { name: string; slug?: string; icon?: string }) {
    const slug = dto.slug || dto.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      const [row] = await this.database.db
        .insert(categories)
        .values({ id: genId('cat'), name: dto.name, slug, icon: dto.icon || null })
        .returning();
      return row;
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException('Nama atau slug kategori sudah digunakan.');
      }
      throw err;
    }
  }

  async findAll() {
    return this.database.db.select().from(categories).orderBy(categories.name);
  }

  async findOne(id: string) {
    const [category] = await this.database.db.select().from(categories).where(eq(categories.id, id));
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
      const [row] = await this.database.db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      return row;
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException('Nama atau slug kategori sudah digunakan.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      const [row] = await this.database.db.delete(categories).where(eq(categories.id, id)).returning();
      return row;
    } catch (err: any) {
      throw new BadRequestException('Tidak dapat menghapus kategori karena masih digunakan oleh produk/jasa.');
    }
  }
}