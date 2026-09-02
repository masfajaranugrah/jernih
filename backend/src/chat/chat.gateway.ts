import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service';
import { users, chats } from '../../db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';

/**
 * Gateway realtime chat.
 * Auth: JWT dari handshake.auth.token (admin) atau cookie mh_token (pelanggan).
 * Setiap user join room dengan nama userId-nya sendiri.
 *
 * Presence: dilacak in-memory + DB (lastSeenAt).
 * Satu user bisa punya banyak koneksi (banyak tab),
 * jadi kita hitung socket per user. Online = punya >=1 socket aktif.
 * lastSeen disimpan ke database saat offline, jadi tahan server restart.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  path: '/api/socket.io',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  static instance: ChatGateway | null = null;

  // userId → jumlah socket aktif
  private readonly connections = new Map<string, number>();

  constructor(
    private jwtService: JwtService,
    private readonly database: DatabaseService,
  ) {
    ChatGateway.instance = this;
  }

  /** Ambil token dari handshake: auth.token dulu, lalu cookie mh_token */
  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken) return authToken;

    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === 'mh_token') return decodeURIComponent(rest.join('='));
    }
    return null;
  }

  // Batas koneksi unauthenticated per IP — cegah DoS
  private readonly MAX_GUEST_CONNECTIONS_PER_IP = 5;
  private readonly guestIpCount = new Map<string, number>();

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);

    if (!token) {
      // Guest connection — izinkan untuk fitur publik (mis. realtime review produk)
      // tapi batasi per IP untuk cegah DoS dari guest tak terbatas.
      const ip = (client.handshake.address as string) ?? 'unknown';
      const count = this.guestIpCount.get(ip) ?? 0;
      if (count >= this.MAX_GUEST_CONNECTIONS_PER_IP) {
        client.emit('error', { message: 'Too many unauthenticated connections' });
        client.disconnect(true);
        return;
      }
      this.guestIpCount.set(ip, count + 1);
      // Bersihkan counter setelah 60 detik
      setTimeout(() => {
        const cur = this.guestIpCount.get(ip) ?? 0;
        if (cur <= 1) this.guestIpCount.delete(ip);
        else this.guestIpCount.set(ip, cur - 1);
      }, 60_000);

      client.data.isGuest = true;
      client.data.userId = 'guest-' + client.id.slice(0, 8);
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub as string;
      client.data.userId = userId;
      client.join(userId);

      const prev = this.connections.get(userId) ?? 0;
      this.connections.set(userId, prev + 1);
      if (prev === 0) {
        this.server.emit('presence:update', { userId, online: true });
      }
    } catch {
      // Token invalid atau expired — tolak koneksi
      // Rate-limit per IP untuk mengurangi serangan flooding dengan token palsu
      const ip = (client.handshake.address as string) ?? 'unknown';
      const count = this.guestIpCount.get(ip) ?? 0;
      if (count >= this.MAX_GUEST_CONNECTIONS_PER_IP) {
        client.emit('error', { message: 'Too many unauthenticated connections' });
        client.disconnect(true);
        return;
      }
      this.guestIpCount.set(ip, count + 1);
      // Bersihkan counter setelah 60 detik
      setTimeout(() => {
        const cur = this.guestIpCount.get(ip) ?? 0;
        if (cur <= 1) this.guestIpCount.delete(ip);
        else this.guestIpCount.set(ip, cur - 1);
      }, 60_000);

      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId as string | undefined;
    if (!userId || userId.startsWith('guest-')) return;

    const prev = this.connections.get(userId) ?? 0;
    const next = Math.max(0, prev - 1);
    if (next === 0) {
      this.connections.delete(userId);
      const seenAt = new Date();
      await this.database.db
        .update(users)
        .set({ lastSeenAt: seenAt })
        .where(eq(users.id, userId))
        .catch(() => {});
      this.server.emit('presence:update', {
        userId,
        online: false,
        lastSeen: seenAt.toISOString(),
      });
    } else {
      this.connections.set(userId, next);
    }
  }

  /** Relay indikator "sedang mengetik" ke lawan bicara (tanpa DB) */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { receiverId?: string },
  ) {
    if (!client.data.userId || !body?.receiverId) return;
    if (body.receiverId === client.data.userId) return;
    this.server
      .to(body.receiverId)
      .emit('typing', { senderId: client.data.userId });
  }

  /**
   * Client menanyakan status presence sekumpulan user (mis. saat baru connect).
   * Balas hanya ke penanya lewat 'presence:state'.
   */
  @SubscribeMessage('presence:query')
  async handlePresenceQuery(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { userIds?: string[] },
  ) {
    if (!client.data.userId || !Array.isArray(body?.userIds)) return;
    // Batasi jumlah user yang bisa dicek (max 10) — cegah enumeration
    const ids = body.userIds.filter((id) => typeof id === 'string').slice(0, 10);
    if (ids.length === 0) return;

    // Hanya izinkan cek presence user yang pernah chat dengan requester
    const chatPartners = await this.database.db
      .select({ senderId: chats.senderId, receiverId: chats.receiverId })
      .from(chats)
      .where(
        or(
          and(eq(chats.senderId, client.data.userId), inArray(chats.receiverId, ids)),
          and(eq(chats.receiverId, client.data.userId), inArray(chats.senderId, ids)),
        ),
      )
      .limit(50);
    const allowedIds = new Set<string>();
    for (const c of chatPartners) {
      if (c.senderId === client.data.userId) allowedIds.add(c.receiverId);
      if (c.receiverId === client.data.userId) allowedIds.add(c.senderId);
    }

    const state: Record<string, { online: boolean; lastSeen: string | null }> = {};

    const unknownIds = ids.filter(
      (id) => allowedIds.has(id) && !this.connections.has(id),
    );

    const dbRecords =
      unknownIds.length > 0
        ? await this.database.db
            .select({ id: users.id, lastSeenAt: users.lastSeenAt })
            .from(users)
            .where(inArray(users.id, unknownIds))
            .catch(() => [])
        : [];

    const dbMap = new Map(dbRecords.map((u) => [u.id, u.lastSeenAt]));

    for (const id of body.userIds) {
      if (typeof id !== 'string') continue;
      const online = (this.connections.get(id) ?? 0) > 0;
      state[id] = {
        online,
        lastSeen: online
          ? null
          : (dbMap.get(id)?.toISOString() ?? null),
      };
    }
    client.emit('presence:state', state);
  }

  // ── Broadcast helpers (dipanggil ChatService) ──────────────────────────────

  emitNewMessage(msg: { senderId: string; receiverId: string }) {
    this.server.to(msg.receiverId).emit('message:new', msg);
    this.server.to(msg.senderId).emit('message:new', msg);
  }

  emitDeleted(senderId: string, receiverId: string, messageId: string) {
    this.server.to(receiverId).emit('message:deleted', { id: messageId });
    this.server.to(senderId).emit('message:deleted', { id: messageId });
  }

  emitRead(readerId: string, senderId: string) {
    this.server.to(senderId).emit('messages:read', { readerId });
  }

  emitTicketEvent(
    event: 'ticket:new' | 'ticket:message' | 'ticket:update',
    userIds: string[],
    payload: unknown,
  ) {
    for (const id of new Set(userIds)) {
      this.server.to(id).emit(event, payload);
    }
  }

  /**
   * Broadcast perubahan status order ke room customer yang memiliki order tersebut.
   * Hanya diterima oleh user yang sudah join room userId-nya sendiri (saat connect).
   */
  emitOrderStatusUpdated(payload: {
    orderId: string;
    userId: string;
    status: string;
    statusLabel: string;
    updatedAt: string;
  }) {
    this.server.to(payload.userId).emit('order:status', {
      orderId: payload.orderId,
      status: payload.status,
      statusLabel: payload.statusLabel,
      updatedAt: payload.updatedAt,
    });
  }

  /**
   * Client join room produk agar bisa menerima review baru secara realtime.
   * Room: 'product:{productId}' — publik, tidak butuh auth.
   */
  @SubscribeMessage('product:join')
  handleProductJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { productId?: string },
  ) {
    const productId = body?.productId;
    if (!productId || typeof productId !== 'string') return;
    // Batasi prefix agar tidak bisa join room sembarang (cegah abuse)
    client.join(`product:${productId}`);
  }

  /**
   * Client leave room produk (cleanup saat unmount).
   */
  @SubscribeMessage('product:leave')
  handleProductLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { productId?: string },
  ) {
    const productId = body?.productId;
    if (!productId || typeof productId !== 'string') return;
    client.leave(`product:${productId}`);
  }

  /**
   * Broadcast review baru ke semua pengunjung halaman produk.
   * Dipanggil dari OrdersService setelah confirmReceived berhasil.
   */
  emitProductReviewNew(payload: {
    productId: string;
    review: {
      id: string;
      rating: number;
      comment: string | null;
      userName: string;
      userAvatar: string | null;
      image: string | null;
      createdAt: string;
    };
    newAvgRating: number;
    newTotalReviews: number;
  }) {
    this.server.to(`product:${payload.productId}`).emit('product:review:new', payload);
  }
}