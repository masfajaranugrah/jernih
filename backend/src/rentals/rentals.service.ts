import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { rentals, rentalItems } from '../../db/schema';
import { eq, and, desc, ilike } from 'drizzle-orm';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { CreateRentalItemDto } from './dto/create-rental-item.dto';
import { UpdateRentalItemDto } from './dto/update-rental-item.dto';

@Injectable()
export class RentalsService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string, dto: CreateRentalDto) {
    const [item] = await this.database.db.select().from(rentalItems).where(eq(rentalItems.id, dto.rentalItemId));
    if (!item) throw new NotFoundException('Item sewa tidak ditemukan');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end <= start) {
      throw new BadRequestException('Tanggal selesai harus setelah tanggal mulai');
    }

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const totalPrice = Number(item.pricePerDay) * totalDays;

    const id = genId('rental');
    await this.database.db.insert(rentals).values({
      id,
      userId,
      mitraId: item.mitraId ?? dto.mitraId ?? '',
      rentalItemId: dto.rentalItemId,
      startDate: start,
      endDate: end,
      totalDays,
      totalPrice: String(totalPrice),
      notes: dto.notes ?? null,
    });

    const row = await this.database.db.query.rentals.findFirst({
      where: eq(rentals.id, id),
      with: { rentalItem: true },
    });
    return row;
  }

  async findAll(userId?: string, mitraId?: string, page = 1, limit = 50) {
    const conditions = [
      ...(userId ? [eq(rentals.userId, userId)] : []),
      ...(mitraId ? [eq(rentals.mitraId, mitraId)] : []),
    ];
    const where = conditions.length ? and(...conditions) : undefined;
    const skip = (page - 1) * limit;
    return this.database.db.query.rentals.findMany({
      where,
      with: {
        rentalItem: true,
        user: { columns: { id: true, name: true, email: true } },
      },
      orderBy: desc(rentals.createdAt),
      limit,
      offset: skip,
    });
  }

  async findOne(id: string) {
    const rental = await this.database.db.query.rentals.findFirst({
      where: eq(rentals.id, id),
      with: {
        rentalItem: true,
        user: { columns: { id: true, name: true, email: true, phone: true } },
        mitra: { columns: { id: true, storeName: true } },
      },
    });
    if (!rental) throw new NotFoundException('Data sewa tidak ditemukan');
    return rental;
  }

  /** findOne dengan IDOR check — hanya pemilik atau ADMIN */
  async findOneSafe(id: string, requesterId: string, requesterRole: string) {
    const rental = await this.findOne(id);
    if (rental.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke data sewa ini');
    }
    return rental;
  }

  async update(id: string, dto: UpdateRentalDto) {
    await this.findOne(id);
    const [row] = await this.database.db
      .update(rentals)
      .set(dto as any)
      .where(eq(rentals.id, id))
      .returning();
    return row;
  }

  // ── Rental Items ────────────────────────────────────────────────────────────
  async findAllItems(query?: { search?: string; all?: boolean; limit?: number; page?: number }) {
    const conditions = [];
    if (!query?.all) conditions.push(eq(rentalItems.isActive, true));
    if (query?.search) conditions.push(ilike(rentalItems.name, `%${query.search}%`));
    const limit = query?.limit != null ? Math.min(100, Math.max(1, Number(query.limit))) : undefined;
    const page = Math.max(1, Number(query?.page) || 1);
    const offset = limit ? (page - 1) * limit : undefined;
    return this.database.db.query.rentalItems.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      orderBy: desc(rentalItems.createdAt),
      limit,
      offset,
    });
  }

  async findItemById(id: string) {
    const [item] = await this.database.db.select().from(rentalItems).where(eq(rentalItems.id, id));
    if (!item) throw new NotFoundException('Item sewa tidak ditemukan');
    return item;
  }

  async findItemBySlug(slug: string) {
    const [item] = await this.database.db.select().from(rentalItems).where(eq(rentalItems.slug, slug));
    if (!item) throw new NotFoundException('Item sewa tidak ditemukan');
    return item;
  }

  async createItem(dto: CreateRentalItemDto) {
    const [row] = await this.database.db
      .insert(rentalItems)
      .values({
        id: genId('ritem'),
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        pricePerDay: String(dto.pricePerDay),
        deposit: dto.deposit != null ? String(dto.deposit) : null,
        images: dto.images ?? [],
        isActive: dto.isActive ?? true,
      })
      .returning();
    return row;
  }

  async updateItem(id: string, dto: UpdateRentalItemDto) {
    await this.findItemById(id);
    const [row] = await this.database.db
      .update(rentalItems)
      .set(dto as any)
      .where(eq(rentalItems.id, id))
      .returning();
    return row;
  }

  async removeItem(id: string) {
    await this.findItemById(id);
    const [row] = await this.database.db
      .delete(rentalItems)
      .where(eq(rentalItems.id, id))
      .returning();
    return row;
  }
}