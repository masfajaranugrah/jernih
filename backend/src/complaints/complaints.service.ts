import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: { userId, ...dto },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(userId?: string) {
    return this.prisma.complaint.findMany({
      where: { ...(userId && { userId }) },
      include: {
        user: { select: { id: true, name: true } },
        order: { select: { id: true, total: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        mitra: { select: { id: true, storeName: true } },
        order: true,
      },
    });
    if (!complaint) throw new NotFoundException('Komplain tidak ditemukan');
    return complaint;
  }

  /** findOne dengan IDOR check — hanya pemilik atau ADMIN */
  async findOneSafe(id: string, requesterId: string, requesterRole: string) {
    const complaint = await this.findOne(id);
    if (complaint.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke komplain ini');
    }
    return complaint;
  }

  async update(id: string, dto: UpdateComplaintDto) {
    await this.findOne(id);
    return this.prisma.complaint.update({ where: { id }, data: dto });
  }
}
