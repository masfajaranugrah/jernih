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
import { PrismaService } from '../prisma/prisma.service';

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

  // userId → jumlah socket aktif
  private readonly connections = new Map<string, number>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

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

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
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
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId as string | undefined;
    if (!userId) return;

    const prev = this.connections.get(userId) ?? 0;
    const next = Math.max(0, prev - 1);
    if (next === 0) {
      this.connections.delete(userId);
      const seenAt = new Date();
      await this.prisma.user
        .update({ where: { id: userId }, data: { lastSeenAt: seenAt } })
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
    const chatPartners = await this.prisma.chat.findMany({
      where: {
        OR: [
          { senderId: client.data.userId, receiverId: { in: ids } },
          { receiverId: client.data.userId, senderId: { in: ids } },
        ],
      },
      select: { senderId: true, receiverId: true },
      take: 50,
    });
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
        ? await this.prisma.user
            .findMany({
              where: { id: { in: unknownIds } },
              select: { id: true, lastSeenAt: true },
            })
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
}
