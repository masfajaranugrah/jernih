import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  /** Ambil semua banner (urut position lalu updatedAt) */
  async findAll() {
    return this.prisma.heroBanner.findMany({
      orderBy: [
        { position: 'asc' },
        { updatedAt: 'asc' },
      ],
    });
  }

  /** Ambil banner berdasarkan ID */
  async findOne(id: string) {
    const banner = await this.prisma.heroBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner dengan ID ${id} tidak ditemukan`);
    return banner;
  }

  /** Buat banner baru */
  async create(dto: UpdateHeroBannerDto) {
    return this.prisma.heroBanner.create({
      data: {
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
      },
    });
  }

  /** Update banner berdasarkan ID */
  async update(id: string, dto: UpdateHeroBannerDto) {
    await this.findOne(id);
    return this.prisma.heroBanner.update({
      where: { id },
      data: dto,
    });
  }

  /** Hapus banner berdasarkan ID */
  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.heroBanner.delete({ where: { id } });
  }

  /** Reset semua banner ke default */
  async resetAll() {
    await this.prisma.heroBanner.deleteMany();
    return { message: 'Semua hero banner berhasil direset' };
  }
}
