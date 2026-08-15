import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TicketStatus } from '../common/enums';
import { DatabaseService, genId } from '../database/database.service';
import { tickets, ticketMessages, users as usersTable } from '../../db/schema';
import { eq, and, ne, asc, desc, inArray, sql } from 'drizzle-orm';
import { ChatGateway } from '../chat/chat.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendTicketMessageDto } from './dto/send-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

// Include standar untuk pesan tiket — pengirim ringkas
const messageWith = {
  sender: { columns: { id: true, name: true, avatar: true, role: true } },
} as const;

const ticketWithUser = {
  user: { columns: { id: true, name: true, email: true, avatar: true } },
} as const;

@Injectable()
export class TicketsService {
  constructor(
    private readonly database: DatabaseService,
    private gateway: ChatGateway,
  ) {}

  /** Admin tujuan notifikasi tiket (1 akun role ADMIN) */
  private async getAdminId(): Promise<string> {
    const [admin] = await this.database.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.role, 'ADMIN'), eq(usersTable.isActive, true)))
      .limit(1);
    if (!admin) throw new NotFoundException('Admin tidak ditemukan');
    return admin.id;
  }

  /** Buat tiket baru + pesan pertama dari deskripsi kendala */
  async create(userId: string, dto: CreateTicketDto) {
    const description = dto.description.trim();
    if (!description) {
      throw new BadRequestException('Deskripsi kendala tidak boleh kosong');
    }

    const subject =
      description.length > 80 ? `${description.slice(0, 80)}…` : description;

    const ticketId = genId('ticket');
    await this.database.db.transaction(async (tx) => {
      await tx
        .insert(tickets)
        .values({
          id: ticketId,
          userId,
          category: dto.category,
          priority: dto.priority,
          subject,
        });
      await tx
        .insert(ticketMessages)
        .values({
          id: genId('tmsg'),
          ticketId,
          senderId: userId,
          message: description,
        });
    });

    const ticket = await this.database.db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: {
        ...ticketWithUser,
        messages: { with: messageWith, orderBy: asc(ticketMessages.createdAt) },
      },
    });

    const adminId = await this.getAdminId();
    this.gateway.emitTicketEvent('ticket:new', [userId, adminId], ticket);
    return ticket;
  }

  /** Daftar tiket milik pelanggan + jumlah pesan belum dibaca */
  async findMine(userId: string) {
    const rows = await this.database.db.query.tickets.findMany({
      where: eq(tickets.userId, userId),
      with: ticketWithUser,
      orderBy: desc(tickets.createdAt),
    });
    return this.withUnreadCounts(rows, userId);
  }

  /** Daftar semua tiket untuk admin, urut nomor (siapa duluan = #1) */
  async findAllAdmin(adminId: string) {
    const rows = await this.database.db.query.tickets.findMany({
      with: ticketWithUser,
      orderBy: asc(tickets.number),
    });
    return this.withUnreadCounts(rows, adminId);
  }

  /** Sisipkan unreadCount (pesan lawan yang belum dibaca) per tiket */
  private async withUnreadCounts<T extends { id: string }>(
    ticketsList: T[],
    viewerId: string,
  ) {
    if (ticketsList.length === 0) return [];
    const ids = ticketsList.map((t) => t.id);

    // Satu query GROUP BY menggantikan 1 query $count per tiket (sebelumnya N+1).
    const counts = await this.database.db
      .select({
        ticketId: ticketMessages.ticketId,
        count: sql<number>`count(*)`,
      })
      .from(ticketMessages)
      .where(
        and(
          inArray(ticketMessages.ticketId, ids),
          eq(ticketMessages.isRead, false),
          ne(ticketMessages.senderId, viewerId),
        ),
      )
      .groupBy(ticketMessages.ticketId);

    const map = new Map(counts.map((c) => [c.ticketId, Number(c.count)]));
    return ticketsList.map((t) => ({ ...t, unreadCount: map.get(t.id) ?? 0 }));
  }

  /** Detail tiket + seluruh pesan. Hanya pemilik atau admin. */
  async findOne(ticketId: string, requesterId: string, requesterRole: string) {
    const ticket = await this.database.db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: {
        ...ticketWithUser,
        messages: {
          with: messageWith,
          orderBy: asc(ticketMessages.createdAt),
        },
      },
    });
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    if (ticket.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }
    return ticket;
  }

  /** Kirim pesan di dalam tiket (ditolak jika tiket sudah ditutup) */
  async addMessage(
    ticketId: string,
    senderId: string,
    senderRole: string,
    dto: SendTicketMessageDto,
  ) {
    const [ticket] = await this.database.db
      .select({ id: tickets.id, userId: tickets.userId, status: tickets.status })
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    if (ticket.userId !== senderId && senderRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }
    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Tiket sudah ditutup');
    }
    if (!dto.message.trim() && !dto.imageUrl) {
      throw new BadRequestException('Pesan tidak boleh kosong');
    }

    const msgId = genId('tmsg');
    await this.database.db
      .insert(ticketMessages)
      .values({
        id: msgId,
        ticketId,
        senderId,
        message: dto.message,
        imageUrl: dto.imageUrl ?? null,
      });

    const msg = await this.database.db.query.ticketMessages.findFirst({
      where: eq(ticketMessages.id, msgId),
      with: messageWith,
    });

    // Tiket kembali aktif di daftar (updatedAt) saat ada pesan baru
    await this.database.db
      .update(tickets)
      .set({ updatedAt: new Date() })
      .where(eq(tickets.id, ticketId));

    const adminId = await this.getAdminId();
    this.gateway.emitTicketEvent('ticket:message', [ticket.userId, adminId], msg);
    return msg;
  }

  /** Tandai semua pesan lawan di tiket sebagai sudah dibaca */
  async markRead(ticketId: string, readerId: string, readerRole: string) {
    const [ticket] = await this.database.db
      .select({ userId: tickets.userId })
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    if (ticket.userId !== readerId && readerRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }
    await this.database.db
      .update(ticketMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(ticketMessages.ticketId, ticketId),
          eq(ticketMessages.isRead, false),
          ne(ticketMessages.senderId, readerId),
        ),
      );
    return { message: 'Pesan ditandai sudah dibaca' };
  }

  /** Ubah status/prioritas tiket (khusus admin) */
  async update(ticketId: string, dto: UpdateTicketDto) {
    const [existing] = await this.database.db
      .select({ userId: tickets.userId })
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    if (!existing) throw new NotFoundException('Tiket tidak ditemukan');

    await this.database.db
      .update(tickets)
      .set({
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
      })
      .where(eq(tickets.id, ticketId));

    const ticket = await this.database.db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: ticketWithUser,
    });

    const adminId = await this.getAdminId();
    this.gateway.emitTicketEvent(
      'ticket:update',
      [existing.userId, adminId],
      ticket,
    );
    return ticket;
  }
}