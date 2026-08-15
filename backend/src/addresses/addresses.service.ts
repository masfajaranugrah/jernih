import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { addresses } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string, dto: CreateAddressDto) {
    // Jika isDefault = true, reset semua address user lainnya
    if (dto.isDefault) {
      await this.database.db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }
    const [row] = await this.database.db
      .insert(addresses)
      .values({ id: genId('addr'), userId, ...(dto as any) })
      .returning();
    return row;
  }

  async findAll(userId: string) {
    return this.database.db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
      orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
    });
  }

  async findOne(id: string) {
    const [row] = await this.database.db.select().from(addresses).where(eq(addresses.id, id));
    if (!row) throw new NotFoundException('Alamat tidak ditemukan');
    return row;
  }

  /** findOne dengan IDOR check — hanya pemilik atau ADMIN */
  async findOneSafe(id: string, requesterId: string, requesterRole: string) {
    const address = await this.findOne(id);
    if (address.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke alamat ini');
    }
    return address;
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    if (dto.isDefault) {
      await this.database.db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }
    const [row] = await this.database.db
      .update(addresses)
      .set(dto as any)
      .where(eq(addresses.id, id))
      .returning();
    return row;
  }

  /** update dengan IDOR check — hanya pemilik */
  async updateSafe(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.findOne(id);
    if (address.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke alamat ini');
    }
    return this.update(id, userId, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.database.db.delete(addresses).where(eq(addresses.id, id));
    return { message: 'Alamat berhasil dihapus' };
  }

  /** remove dengan IDOR check — hanya pemilik atau ADMIN */
  async removeSafe(id: string, requesterId: string, requesterRole: string) {
    const address = await this.findOne(id);
    if (address.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke alamat ini');
    }
    await this.database.db.delete(addresses).where(eq(addresses.id, id));
    return { message: 'Alamat berhasil dihapus' };
  }
}