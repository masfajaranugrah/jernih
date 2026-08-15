import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { users, orders, wishlists } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db
      .select({
        id: users.id, email: users.email, name: users.name, phone: users.phone,
        avatar: users.avatar, role: users.role, isActive: users.isActive, createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async findOne(id: string) {
    const user = await this.database.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true, email: true, name: true, phone: true,
        avatar: true, role: true, isActive: true, createdAt: true,
      },
      with: { mitra: { columns: { id: true, storeName: true, isVerified: true } } },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const [orderCount, wishlistCount] = await Promise.all([
      this.database.db.$count(orders, eq(orders.userId, id)),
      this.database.db.$count(wishlists, eq(wishlists.userId, id)),
    ]);

    return { ...user, _count: { orders: orderCount, wishlist: wishlistCount } };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const [row] = await this.database.db
      .update(users)
      .set(dto as any)
      .where(eq(users.id, id))
      .returning({
        id: users.id, email: users.email, name: users.name, phone: users.phone,
        avatar: users.avatar, role: users.role, updatedAt: users.updatedAt,
      });
    return row;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.database.db.delete(users).where(eq(users.id, id));
    return { message: 'User berhasil dihapus' };
  }
}