import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService, genId } from '../database/database.service';
import { complaints } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string, dto: CreateComplaintDto) {
    const id = genId('cmp');
    await this.database.db
      .insert(complaints)
      .values({ id, userId, ...(dto as any) });
    const row = await this.database.db.query.complaints.findFirst({
      where: eq(complaints.id, id),
      with: { user: { columns: { id: true, name: true, email: true } } },
    });
    return row;
  }

  async findAll(userId?: string) {
    return this.database.db.query.complaints.findMany({
      where: userId ? eq(complaints.userId, userId) : undefined,
      with: {
        user: { columns: { id: true, name: true } },
        order: { columns: { id: true, total: true } },
      },
      orderBy: desc(complaints.createdAt),
    });
  }

  async findOne(id: string) {
    const row = await this.database.db.query.complaints.findFirst({
      where: eq(complaints.id, id),
      with: {
        user: { columns: { id: true, name: true, email: true } },
        mitra: { columns: { id: true, storeName: true } },
        order: true,
      },
    });
    if (!row) throw new NotFoundException('Komplain tidak ditemukan');
    return row;
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
    const [row] = await this.database.db
      .update(complaints)
      .set(dto as any)
      .where(eq(complaints.id, id))
      .returning();
    return row;
  }
}