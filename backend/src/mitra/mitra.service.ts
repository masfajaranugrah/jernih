import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { mitras, services, rentals } from '../../db/schema';
import { eq, desc, and, ilike, inArray, sql } from 'drizzle-orm';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';

@Injectable()
export class MitraService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string, dto: CreateMitraDto) {
    const existing = await this.database.db.select().from(mitras).where(eq(mitras.userId, userId));
    if (existing.length) throw new ConflictException('Akun mitra sudah terdaftar');

    const [row] = await this.database.db
      .insert(mitras)
      .values({ id: genId('mitra'), userId, ...(dto as any) })
      .returning();
    return row;
  }

  async findAll(query?: { city?: string; isVerified?: boolean }) {
    const conditions = [
      eq(mitras.isActive, true),
      ...(query?.city ? [ilike(mitras.city, `%${query.city}%`)] : []),
      ...(query?.isVerified !== undefined ? [eq(mitras.isVerified, query.isVerified)] : []),
    ];
    const rows = await this.database.db.query.mitras.findMany({
      where: and(...conditions),
      with: {
        user: { columns: { name: true, email: true, avatar: true } },
      },
      orderBy: desc(mitras.rating),
    });
    if (rows.length === 0) return [];

    // Hitung jumlah jasa per mitra dengan aggregate GROUP BY sekali query,
    // menggantikan pola memuat SEMUA baris services hanya untuk dihitung .length.
    const ids = rows.map((m) => m.id);
    const counts = await this.database.db
      .select({ mitraId: services.mitraId, count: sql<number>`count(*)` })
      .from(services)
      .where(inArray(services.mitraId, ids))
      .groupBy(services.mitraId);
    const countMap = new Map(counts.map((c) => [c.mitraId, Number(c.count)]));

    return rows.map((m) => ({ ...m, _count: { services: countMap.get(m.id) ?? 0 } }));
  }

  async findOne(id: string) {
    const mitra = await this.database.db.query.mitras.findFirst({
      where: eq(mitras.id, id),
      with: {
        user: { columns: { name: true, email: true, avatar: true } },
        services: { where: eq(services.isActive, true), limit: 8 },
      },
    });
    if (!mitra) throw new NotFoundException('Mitra tidak ditemukan');

    const [serviceCount, rentalCount] = await Promise.all([
      this.database.db.$count(services, eq(services.mitraId, id)),
      this.database.db.$count(rentals, eq(rentals.mitraId, id)),
    ]);

    return { ...mitra, _count: { services: serviceCount, rentals: rentalCount } };
  }

  async findByUser(userId: string) {
    const mitra = await this.database.db.query.mitras.findFirst({
      where: eq(mitras.userId, userId),
    });
    if (!mitra) return null;

    const [serviceCount, rentalCount] = await Promise.all([
      this.database.db.$count(services, eq(services.mitraId, mitra.id)),
      this.database.db.$count(rentals, eq(rentals.mitraId, mitra.id)),
    ]);

    return { ...mitra, _count: { services: serviceCount, rentals: rentalCount } };
  }

  async update(id: string, dto: UpdateMitraDto) {
    const [row] = await this.database.db
      .update(mitras)
      .set(dto as any)
      .where(eq(mitras.id, id))
      .returning();
    return row;
  }

  /** update dengan IDOR check — hanya pemilik mitra */
  async updateSafe(id: string, dto: UpdateMitraDto, userId: string) {
    const mitra = await this.findOne(id);
    if (mitra.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke mitra ini');
    }
    return this.update(id, dto);
  }

  async verify(id: string) {
    const [row] = await this.database.db
      .update(mitras)
      .set({ isVerified: true })
      .where(eq(mitras.id, id))
      .returning();
    return row;
  }
}