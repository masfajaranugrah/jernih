import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendTicketMessageDto } from './dto/send-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

// Include standar untuk pesan tiket — pengirim ringkas
const messageInclude = {
  sender: { select: { id: true, name: true, avatar: true, role: true } },
} as const;

const ticketInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
} as const;

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,
  ) {}

  /** Admin tujuan notifikasi tiket (1 akun role ADMIN) */
  private async getAdminId(): Promise<string> {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });
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

    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        category: dto.category,
        priority: dto.priority,
        subject,
        messages: {
          create: { senderId: userId, message: description },
        },
      },
      include: {
        ...ticketInclude,
        messages: { include: messageInclude },
      },
    });

    const adminId = await this.getAdminId();
    this.gateway.emitTicketEvent('ticket:new', [userId, adminId], ticket);
    return ticket;
  }

  /** Daftar tiket milik pelanggan + jumlah pesan belum dibaca */
  async findMine(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: ticketInclude,
      orderBy: { createdAt: 'desc' },
    });
    return this.withUnreadCounts(tickets, userId);
  }

  /** Daftar semua tiket untuk admin, urut nomor (siapa duluan = #1) */
  async findAllAdmin(adminId: string) {
    const tickets = await this.prisma.ticket.findMany({
      include: ticketInclude,
      orderBy: { number: 'asc' },
    });
    return this.withUnreadCounts(tickets, adminId);
  }

  /** Sisipkan unreadCount (pesan lawan yang belum dibaca) per tiket */
  private async withUnreadCounts<T extends { id: string }>(
    tickets: T[],
    viewerId: string,
  ) {
    if (tickets.length === 0) return [];
    const counts = await this.prisma.ticketMessage.groupBy({
      by: ['ticketId'],
      where: {
        ticketId: { in: tickets.map((t) => t.id) },
        isRead: false,
        NOT: { senderId: viewerId },
      },
      _count: { id: true },
    });
    const map = new Map(counts.map((c) => [c.ticketId, c._count.id]));
    return tickets.map((t) => ({ ...t, unreadCount: map.get(t.id) ?? 0 }));
  }

  /** Detail tiket + seluruh pesan. Hanya pemilik atau admin. */
  async findOne(ticketId: string, requesterId: string, requesterRole: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        ...ticketInclude,
        messages: {
          include: messageInclude,
          orderBy: { createdAt: 'asc' },
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
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true, status: true },
    });
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

    const msg = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message: dto.message,
        imageUrl: dto.imageUrl,
      },
      include: messageInclude,
    });

    // Tiket kembali aktif di daftar (updatedAt) saat ada pesan baru
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    const adminId = await this.getAdminId();
    this.gateway.emitTicketEvent('ticket:message', [ticket.userId, adminId], msg);
    return msg;
  }

  /** Tandai semua pesan lawan di tiket sebagai sudah dibaca */
  async markRead(ticketId: string, readerId: string, readerRole: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    if (ticket.userId !== readerId && readerRole !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }
    await this.prisma.ticketMessage.updateMany({
      where: { ticketId, isRead: false, NOT: { senderId: readerId } },
      data: { isRead: true },
    });
    return { message: 'Pesan ditandai sudah dibaca' };
  }

  /** Ubah status/prioritas tiket (khusus admin) */
  async update(ticketId: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });
    if (!existing) throw new NotFoundException('Tiket tidak ditemukan');

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
      },
      include: ticketInclude,
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
