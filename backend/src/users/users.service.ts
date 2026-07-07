import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, name: true, phone: true,
        avatar: true, role: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true,
        avatar: true, role: true, isActive: true, createdAt: true,
        mitra: { select: { id: true, storeName: true, isVerified: true } },
        _count: { select: { orders: true, wishlist: true } },
      },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, email: true, name: true, phone: true,
        avatar: true, role: true, updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User berhasil dihapus' };
  }
}
