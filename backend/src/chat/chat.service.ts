import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    return this.prisma.chat.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        message: dto.message,
        imageUrl: dto.imageUrl,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  /** Ambil riwayat percakapan antara dua user */
  async getConversation(userId: string, otherId: string) {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
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
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
            receiver: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await this.prisma.chat.count({
          where: { senderId: partnerId, receiverId: userId, isRead: false },
        });

        return { lastMessage, unreadCount };
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
    return { message: 'Pesan ditandai sudah dibaca' };
  }
}
