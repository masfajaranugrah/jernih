import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  /** Ambil semua banner (urut position) */
  async findAll() {
    return this.prisma.heroBanner.findMany({
      orderBy: { position: 'asc' },
    });
  }

  /** Ambil satu banner berdasarkan position */
  async findByPosition(position: number) {
    const banner = await this.prisma.heroBanner.findUnique({ where: { position } });
    if (!banner) throw new NotFoundException(`Banner position ${position} tidak ditemukan`);
    return banner;
  }

  /** Update atau buat banner berdasarkan position */
  async upsert(position: number, dto: UpdateHeroBannerDto) {
    return this.prisma.heroBanner.upsert({
      where: { position },
      create: { position, title: dto.title ?? '', ...dto },
      update: dto,
    });
  }

  /** Reset semua banner ke default */
  async resetAll() {
    await this.prisma.heroBanner.deleteMany();
    return { message: 'Semua hero banner berhasil direset' };
  }
}
