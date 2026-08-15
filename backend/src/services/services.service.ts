import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { services } from '../../db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateServiceDto) {
    try {
      const [row] = await this.database.db
        .insert(services)
        .values({ id: genId('svc'), ...(dto as any) })
        .returning();
      return row;
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException('Harga terlalu besar. Maksimum adalah Rp 9.999.999.999');
      }
      if (err?.code === '23505') {
        throw new BadRequestException('Slug jasa sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async findAll(query?: {
    search?: string;
    categoryId?: string;
    mitraId?: string;
    limit?: number;
    page?: number;
  }) {
    const conditions = [
      eq(services.isActive, true),
      ...(query?.search
        ? [or(ilike(services.name, `%${query.search}%`), ilike(services.description, `%${query.search}%`))]
        : []),
      ...(query?.categoryId ? [eq(services.categoryId, query.categoryId)] : []),
      ...(query?.mitraId ? [eq(services.mitraId, query.mitraId)] : []),
    ];
    const limit = query?.limit != null ? Math.min(100, Math.max(1, Number(query.limit))) : undefined;
    const page = Math.max(1, Number(query?.page) || 1);
    const offset = limit ? (page - 1) * limit : undefined;
    return this.database.db.query.services.findMany({
      where: and(...conditions),
      with: {
        mitra: { columns: { id: true, storeName: true, city: true } },
        category: { columns: { id: true, name: true } },
      },
      orderBy: desc(services.createdAt),
      limit,
      offset,
    });
  }

  async findOne(id: string) {
    const service = await this.database.db.query.services.findFirst({
      where: eq(services.id, id),
      with: {
        mitra: { columns: { id: true, storeName: true, logo: true, city: true, rating: true } },
        category: true,
      },
    });
    if (!service) throw new NotFoundException('Jasa tidak ditemukan');
    return service;
  }

  async findBySlug(slug: string) {
    const service = await this.database.db.query.services.findFirst({
      where: eq(services.slug, slug),
      with: {
        mitra: { columns: { id: true, storeName: true, logo: true, city: true, rating: true } },
        category: true,
      },
    });
    if (!service) throw new NotFoundException('Jasa tidak ditemukan');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    try {
      const [row] = await this.database.db
        .update(services)
        .set(dto as any)
        .where(eq(services.id, id))
        .returning();
      return row;
    } catch (err: any) {
      if (err?.message?.includes('numeric field overflow') || err?.code === '22003') {
        throw new BadRequestException('Harga terlalu besar. Maksimum adalah Rp 9.999.999.999');
      }
      if (err?.code === '23505') {
        throw new BadRequestException('Slug jasa sudah digunakan, gunakan nama yang berbeda.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.database.db.delete(services).where(eq(services.id, id));
    return { message: 'Jasa berhasil dihapus' };
  }
}