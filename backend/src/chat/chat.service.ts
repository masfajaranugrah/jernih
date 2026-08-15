import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { join, basename } from 'path';
import { promises as fs } from 'fs';
import { DatabaseService, genId } from '../database/database.service';
import { users as usersTable, chats, products } from '../../db/schema';
import { eq, and, or, desc, asc, inArray, ne, sql, lt } from 'drizzle-orm';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';

// Include standar untuk setiap pesan — sender/receiver ringkas + card produk
const messageWith = {
  sender: { columns: { id: true, name: true, avatar: true } },
  receiver: { columns: { id: true, name: true, avatar: true } },
  product: {
    columns: { id: true, name: true, slug: true, price: true, images: true },
  },
} as const;

@Injectable()
export class ChatService {
  constructor(
    private readonly database: DatabaseService,
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
    const sender = await this.database.db.query.users.findFirst({
      where: eq(usersTable.id, senderId),
      columns: { role: true },
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
      const [product] = await this.database.db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, dto.productId));
      if (!product) throw new NotFoundException('Produk tidak ditemukan');
    }

    const id = genId('chat');
    await this.database.db.insert(chats).values({
      id,
      senderId,
      receiverId,
      message: dto.message,
      imageUrl: dto.imageUrl ?? null,
      videoUrl: dto.videoUrl ?? null,
      productId: dto.productId ?? null,
    });

    const msg = await this.database.db.query.chats.findFirst({
      where: eq(chats.id, id),
      with: messageWith,
    });

    this.gateway.emitNewMessage(msg!);
    return msg;
  }

  /** Kirim pesan sistem (dari order, notifikasi, dll) */
  async sendSystemMessage(
    adminId: string,
    body: { message: string; type?: string; orderNumber?: string; receiverId?: string },
  ) {
    if (!body.message) throw new BadRequestException('Pesan tidak boleh kosong');

    // Cari receiver: jika tidak ditentukan, cari user yang bukan admin
    let receiverId = body.receiverId;
    if (!receiverId) {
      const admin = await this.database.db.query.users.findFirst({
        where: eq(usersTable.id, adminId),
        columns: { role: true },
      });
      // Kirim ke admin sendiri jika tidak ada receiver spesifik
      receiverId = adminId;
    }

    const id = genId('chat');
    await this.database.db.insert(chats).values({
      id,
      senderId: adminId,
      receiverId,
      message: body.message,
      isSystem: true,
    });

    const msg = await this.database.db.query.chats.findFirst({
      where: eq(chats.id, id),
      with: { sender: { columns: { id: true, name: true, avatar: true } } },
    });

    // Broadcast via gateway
    try {
      const gateway = this.getGateway();
      if (gateway) {
        gateway.emitNewMessage({
          senderId: adminId,
          receiverId,
          message: body.message,
          id: msg!.id,
          isSystem: true,
          createdAt: msg!.createdAt,
        } as any);
      }
    } catch { /* gateway mungkin tidak tersedia */ }

    return msg;
  }

  private getGateway() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ChatGateway } = require('./chat.gateway');
      return ChatGateway?.instance;
    } catch { return null; }
  }

  /** Ambil riwayat percakapan antara dua user.
   *  `limit` (default 100, maks 500) + `before` (tanggal ISO) untuk memuat
   *  halaman pesan yang lebih lama tanpa menurunkan seluruh riwayat.
   */
  async getConversation(userId: string, otherId: string, limit = 100, before?: string) {
    const pageLimit = Math.min(500, Math.max(1, Number(limit) || 100));
    const messages = await this.database.db.query.chats.findMany({
      where: and(
        or(
          and(eq(chats.senderId, userId), eq(chats.receiverId, otherId)),
          and(eq(chats.senderId, otherId), eq(chats.receiverId, userId)),
        ),
        ...(before ? [lt(chats.createdAt, new Date(before))] : []),
      ),
      with: messageWith,
      orderBy: asc(chats.createdAt),
      limit: pageLimit,
    });
    return messages.map((m) => this.sanitize(m));
  }

  /** Ambil daftar percakapan (inbox) user */
  async getInbox(userId: string) {
    const db = this.database.db;

    // Pesan terakhir per lawan bicara dalam SATU query (DISTINCT ON).
    // Menggantikan pola lama 2 query per percakapan → sekarang konstan berapa pun
    // jumlah percakapannya. Membaca lewat index (senderId, receiverId, createdAt).
    const res = await db.execute(sql`
      SELECT DISTINCT ON (partner) partner, id AS "messageId"
      FROM (
        SELECT "receiverId" AS partner, id, "createdAt"
        FROM ${chats}
        WHERE "senderId" = ${userId}
        UNION ALL
        SELECT "senderId" AS partner, id, "createdAt"
        FROM ${chats}
        WHERE "receiverId" = ${userId}
      ) all_messages
      ORDER BY partner, "createdAt" DESC NULLS LAST
    `);
    const rows = (res.rows as Array<{ partner: string; messageId: string }>) ?? [];
    if (rows.length === 0) return [];

    // Jumlah pesan belum dibaca per pengirim — satu query GROUP BY (sebelumnya
    // ada 1 query $count per percakapan).
    const unreadRows = await db
      .select({ senderId: chats.senderId, count: sql<number>`count(*)` })
      .from(chats)
      .where(
        and(
          eq(chats.receiverId, userId),
          eq(chats.isRead, false),
          eq(chats.isDeleted, false),
          ne(chats.senderId, userId),
        ),
      )
      .groupBy(chats.senderId);

    const unreadMap = new Map(unreadRows.map((r) => [r.senderId, Number(r.count)]));

    // Muat pesan terakhir + relasi (sender/receiver/product) secara batch dengan
    // satu WHERE IN — relational query dipecah Drizzle jadi beberapa query konstan.
    const ids = rows.map((r) => r.messageId);
    const messages = await db.query.chats.findMany({
      where: inArray(chats.id, ids),
      with: messageWith,
      orderBy: desc(chats.createdAt),
    });

    const byPartner = new Map<string, (typeof messages)[number]>();
    for (const m of messages) {
      const partner = m.senderId === userId ? m.receiverId : m.senderId;
      if (!byPartner.has(partner)) byPartner.set(partner, m);
    }

    return rows
      .map((r) => ({
        lastMessage: this.sanitize(byPartner.get(r.partner) ?? null),
        unreadCount: unreadMap.get(r.partner) ?? 0,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessage!.createdAt).getTime() -
          new Date(a.lastMessage!.createdAt).getTime(),
      );
  }

  async markAsRead(userId: string, senderId: string) {
    await this.database.db
      .update(chats)
      .set({ isRead: true })
      .where(
        and(
          eq(chats.senderId, senderId),
          eq(chats.receiverId, userId),
          eq(chats.isRead, false),
        ),
      );
    this.gateway.emitRead(userId, senderId);
    return { message: 'Pesan ditandai sudah dibaca' };
  }

  /** Ambil admin tujuan chat pelanggan */
  async getAdminId() {
    const [admin] = await this.database.db
      .select({ id: usersTable.id, name: usersTable.name, avatar: usersTable.avatar })
      .from(usersTable)
      .where(and(eq(usersTable.role, 'ADMIN'), eq(usersTable.isActive, true)))
      .limit(1);
    if (!admin) throw new NotFoundException('Admin tidak ditemukan');
    return admin;
  }

  /** Hapus pesan untuk semua (soft delete) + hapus file lampiran dari disk */
  async deleteMessage(userId: string, messageId: string) {
    const [msg] = await this.database.db.select().from(chats).where(eq(chats.id, messageId));
    if (!msg) throw new NotFoundException('Pesan tidak ditemukan');
    if (msg.senderId !== userId) {
      throw new ForbiddenException('Hanya pengirim yang bisa menghapus pesan');
    }
    if (msg.isDeleted) return { message: 'Pesan sudah dihapus' };

    // Hapus file lampiran dari public/uploads agar hemat storage
    await Promise.all(
      [msg.imageUrl, msg.videoUrl].map((url) => this.deleteUploadedFile(url)),
    );

    await this.database.db
      .update(chats)
      .set({
        isDeleted: true,
        message: '',
        imageUrl: null,
        videoUrl: null,
        productId: null,
      })
      .where(eq(chats.id, messageId));

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