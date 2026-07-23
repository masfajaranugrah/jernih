"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const jwt_1 = require("@nestjs/jwt");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatGateway = class ChatGateway {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.connections = new Map();
    }
    extractToken(client) {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken)
            return authToken;
        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader)
            return null;
        for (const part of cookieHeader.split(';')) {
            const [name, ...rest] = part.trim().split('=');
            if (name === 'mh_token')
                return decodeURIComponent(rest.join('='));
        }
        return null;
    }
    async handleConnection(client) {
        const token = this.extractToken(client);
        if (!token) {
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            client.data.userId = userId;
            client.join(userId);
            const prev = this.connections.get(userId) ?? 0;
            this.connections.set(userId, prev + 1);
            if (prev === 0) {
                this.server.emit('presence:update', { userId, online: true });
            }
        }
        catch {
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        const prev = this.connections.get(userId) ?? 0;
        const next = Math.max(0, prev - 1);
        if (next === 0) {
            this.connections.delete(userId);
            const seenAt = new Date();
            await this.prisma.user
                .update({ where: { id: userId }, data: { lastSeenAt: seenAt } })
                .catch(() => { });
            this.server.emit('presence:update', {
                userId,
                online: false,
                lastSeen: seenAt.toISOString(),
            });
        }
        else {
            this.connections.set(userId, next);
        }
    }
    handleTyping(client, body) {
        if (!client.data.userId || !body?.receiverId)
            return;
        if (body.receiverId === client.data.userId)
            return;
        this.server
            .to(body.receiverId)
            .emit('typing', { senderId: client.data.userId });
    }
    async handlePresenceQuery(client, body) {
        if (!client.data.userId || !Array.isArray(body?.userIds))
            return;
        const ids = body.userIds.filter((id) => typeof id === 'string').slice(0, 10);
        if (ids.length === 0)
            return;
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
        const allowedIds = new Set();
        for (const c of chatPartners) {
            if (c.senderId === client.data.userId)
                allowedIds.add(c.receiverId);
            if (c.receiverId === client.data.userId)
                allowedIds.add(c.senderId);
        }
        const state = {};
        const unknownIds = ids.filter((id) => allowedIds.has(id) && !this.connections.has(id));
        const dbRecords = unknownIds.length > 0
            ? await this.prisma.user
                .findMany({
                where: { id: { in: unknownIds } },
                select: { id: true, lastSeenAt: true },
            })
                .catch(() => [])
            : [];
        const dbMap = new Map(dbRecords.map((u) => [u.id, u.lastSeenAt]));
        for (const id of body.userIds) {
            if (typeof id !== 'string')
                continue;
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
    emitNewMessage(msg) {
        this.server.to(msg.receiverId).emit('message:new', msg);
        this.server.to(msg.senderId).emit('message:new', msg);
    }
    emitDeleted(senderId, receiverId, messageId) {
        this.server.to(receiverId).emit('message:deleted', { id: messageId });
        this.server.to(senderId).emit('message:deleted', { id: messageId });
    }
    emitRead(readerId, senderId) {
        this.server.to(senderId).emit('messages:read', { readerId });
    }
    emitTicketEvent(event, userIds, payload) {
        for (const id of new Set(userIds)) {
            this.server.to(id).emit(event, payload);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('presence:query'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handlePresenceQuery", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 20000,
        path: '/api/socket.io',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map