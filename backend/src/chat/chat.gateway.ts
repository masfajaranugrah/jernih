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

/**
 * Gateway realtime chat.
 * Auth: JWT dari handshake.auth.token (admin) atau cookie mh_token (pelanggan).
 * Setiap user join room dengan nama userId-nya sendiri.
 *
 * Presence: dilacak in-memory. Satu user bisa punya banyak koneksi (banyak tab),
 * jadi kita hitung socket per user. Online = punya >=1 socket aktif.
 * lastSeen hanya bertahan selama proses hidup (reset saat server restart).
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId → jumlah socket aktif
  private readonly connections = new Map<string, number>();
  // userId → ISO timestamp terakhir online
  private readonly lastSeen = new Map<string, string>();

  constructor(private jwtService: JwtService) {}

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

  handleConnection(client: Socket) {
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
      // Transisi offline → online: kabari semua client
      if (prev === 0) {
        this.server.emit('presence:update', { userId, online: true });
      }
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId as string | undefined;
    if (!userId) return;

    const prev = this.connections.get(userId) ?? 0;
    const next = Math.max(0, prev - 1);
    if (next === 0) {
      // Socket terakhir user ini terputus → offline
      this.connections.delete(userId);
      const seenAt = new Date().toISOString();
      this.lastSeen.set(userId, seenAt);
      this.server.emit('presence:update', {
        userId,
        online: false,
        lastSeen: seenAt,
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
    // Jangan pantulkan indikator ke pengetiknya sendiri
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
  handlePresenceQuery(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { userIds?: string[] },
  ) {
    if (!client.data.userId || !Array.isArray(body?.userIds)) return;
    const state: Record<string, { online: boolean; lastSeen: string | null }> =
      {};
    for (const id of body.userIds) {
      if (typeof id !== 'string') continue;
      state[id] = {
        online: (this.connections.get(id) ?? 0) > 0,
        lastSeen: this.lastSeen.get(id) ?? null,
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

  /** Broadcast event tiket bantuan ke sekumpulan user (customer + admin) */
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
