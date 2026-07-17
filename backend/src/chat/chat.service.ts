import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { join, basename } from 'path';
import { promises as fs } from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';

// Include standar untuk setiap pesan — sender/receiver ringkas + card produk
const messageInclude = {
  sender: { select: { id: true, name: true, avatar: true } },
  receiver: { select: { id: true, name: true, avatar: true } },
  product: {
    select: { id: true, name: true, slug: true, price: true, images: true },
  },
} as const;

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,
  ) {}

  /** Kosongkan konten pesan yang sudah dihapus sebelum dikirim ke client */
  private sanitize<T extends { isDeleted?: boolean }>(msg: T | null): T | null {
    if (!msg || !msg.isDeleted) return msg;
    return {
      ...msg,
      message: '',
      imageUrl: null,
      videoUrl: null,
      productId: null,
      product: null,
    };
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    // Pesan dari pelanggan SELALU diarahkan ke admin, apa pun receiverId-nya.
    // Admin tetap memakai receiverId dari client (memilih pelanggan tujuan).
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true },
    });
    if (!sender) throw new NotFoundException('Pengirim tidak ditemukan');

    let receiverId = dto.receiverId;
    if (sender.role !== 'ADMIN') {
      const admin = await this.getAdminId();
      receiverId = admin.id;
    }
    if (senderId === receiverId) {
      throw new BadRequestException(
        'Tidak bisa mengirim pesan ke diri sendiri',
      );
    }

    const hasContent =
      dto.message.trim() !== '' || dto.imageUrl || dto.videoUrl || dto.productId;
    if (!hasContent) {
      throw new BadRequestException('Pesan tidak boleh kosong');
    }

    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        select: { id: true },
      });
      if (!product) throw new NotFoundException('Produk tidak ditemukan');
    }

    const msg = await this.prisma.chat.create({
      data: {
        senderId,
        receiverId,
        message: dto.message,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl,
        productId: dto.productId,
      },
      include: messageInclude,
    });

    this.gateway.emitNewMessage(msg);
    return msg;
  }

  /** Ambil riwayat percakapan antara dua user */
  async getConversation(userId: string, otherId: string) {
    const messages = await this.prisma.chat.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: messageInclude,
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((m) => this.sanitize(m));
  }

  /** Ambil daftar percakapan (inbox) user */
  async getInbox(userId: string) {
    // Ambil semua unique lawan bicara
    const sent = await this.prisma.chat.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await this.prisma.chat.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const partnerIds = [
      ...new Set([
        ...sent.map((c) => c.receiverId),
        ...received.map((c) => c.senderId),
      ]),
    ].filter((id) => id !== userId);

    // Ambil pesan terakhir per percakapan
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const lastMessage = await this.prisma.chat.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: partnerId },
              { senderId: partnerId, receiverId: userId },
            ],
          },
          include: messageInclude,
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await this.prisma.chat.count({
          where: { senderId: partnerId, receiverId: userId, isRead: false },
        });

        return { lastMessage: this.sanitize(lastMessage), unreadCount };
      }),
    );

    return conversations.sort(
      (a, b) =>
        new Date(b.lastMessage!.createdAt).getTime() -
        new Date(a.lastMessage!.createdAt).getTime(),
    );
  }

  async markAsRead(userId: string, senderId: string) {
    await this.prisma.chat.updateMany({
      where: { senderId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });
    this.gateway.emitRead(userId, senderId);
    return { message: 'Pesan ditandai sudah dibaca' };
  }

  /** Ambil admin tujuan chat pelanggan */
  async getAdminId() {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true, name: true, avatar: true },
    });
    if (!admin) throw new NotFoundException('Admin tidak ditemukan');
    return admin;
  }

  /** Hapus pesan untuk semua (soft delete) + hapus file lampiran dari disk */
  async deleteMessage(userId: string, messageId: string) {
    const msg = await this.prisma.chat.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Pesan tidak ditemukan');
    if (msg.senderId !== userId) {
      throw new ForbiddenException('Hanya pengirim yang bisa menghapus pesan');
    }
    if (msg.isDeleted) return { message: 'Pesan sudah dihapus' };

    // Hapus file lampiran dari public/uploads agar hemat storage
    await Promise.all(
      [msg.imageUrl, msg.videoUrl].map((url) => this.deleteUploadedFile(url)),
    );

    await this.prisma.chat.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        message: '',
        imageUrl: null,
        videoUrl: null,
        productId: null,
      },
    });

    this.gateway.emitDeleted(msg.senderId, msg.receiverId, messageId);
    return { message: 'Pesan dihapus' };
  }

  /** Hapus file di public/uploads dari URL-nya (aman dari path traversal) */
  private async deleteUploadedFile(url: string | null) {
    if (!url) return;
    try {
      const pathname = new URL(url).pathname;
      if (!pathname.startsWith('/uploads/')) return;
      const name = basename(pathname);
      if (!name || name.includes('..') || name.includes('/')) return;
      await fs.unlink(join(process.cwd(), 'public', 'uploads', name));
    } catch {
      // File tidak ada / URL invalid — abaikan
    }
  }
}
