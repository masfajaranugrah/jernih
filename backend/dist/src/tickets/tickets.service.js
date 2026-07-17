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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_gateway_1 = require("../chat/chat.gateway");
const messageInclude = {
    sender: { select: { id: true, name: true, avatar: true, role: true } },
};
const ticketInclude = {
    user: { select: { id: true, name: true, email: true, avatar: true } },
};
let TicketsService = class TicketsService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async getAdminId() {
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN', isActive: true },
            select: { id: true },
        });
        if (!admin)
            throw new common_1.NotFoundException('Admin tidak ditemukan');
        return admin.id;
    }
    async create(userId, dto) {
        const description = dto.description.trim();
        if (!description) {
            throw new common_1.BadRequestException('Deskripsi kendala tidak boleh kosong');
        }
        const subject = description.length > 80 ? `${description.slice(0, 80)}…` : description;
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
    async findMine(userId) {
        const tickets = await this.prisma.ticket.findMany({
            where: { userId },
            include: ticketInclude,
            orderBy: { createdAt: 'desc' },
        });
        return this.withUnreadCounts(tickets, userId);
    }
    async findAllAdmin(adminId) {
        const tickets = await this.prisma.ticket.findMany({
            include: ticketInclude,
            orderBy: { number: 'asc' },
        });
        return this.withUnreadCounts(tickets, adminId);
    }
    async withUnreadCounts(tickets, viewerId) {
        if (tickets.length === 0)
            return [];
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
    async findOne(ticketId, requesterId, requesterRole) {
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
        if (!ticket)
            throw new common_1.NotFoundException('Tiket tidak ditemukan');
        if (ticket.userId !== requesterId && requesterRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke tiket ini');
        }
        return ticket;
    }
    async addMessage(ticketId, senderId, senderRole, dto) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { id: true, userId: true, status: true },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Tiket tidak ditemukan');
        if (ticket.userId !== senderId && senderRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke tiket ini');
        }
        if (ticket.status === client_1.TicketStatus.CLOSED) {
            throw new common_1.BadRequestException('Tiket sudah ditutup');
        }
        if (!dto.message.trim() && !dto.imageUrl) {
            throw new common_1.BadRequestException('Pesan tidak boleh kosong');
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
        await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() },
        });
        const adminId = await this.getAdminId();
        this.gateway.emitTicketEvent('ticket:message', [ticket.userId, adminId], msg);
        return msg;
    }
    async markRead(ticketId, readerId, readerRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { userId: true },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Tiket tidak ditemukan');
        if (ticket.userId !== readerId && readerRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Anda tidak memiliki akses ke tiket ini');
        }
        await this.prisma.ticketMessage.updateMany({
            where: { ticketId, isRead: false, NOT: { senderId: readerId } },
            data: { isRead: true },
        });
        return { message: 'Pesan ditandai sudah dibaca' };
    }
    async update(ticketId, dto) {
        const existing = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { userId: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Tiket tidak ditemukan');
        const ticket = await this.prisma.ticket.update({
            where: { id: ticketId },
            data: {
                ...(dto.status && { status: dto.status }),
                ...(dto.priority && { priority: dto.priority }),
            },
            include: ticketInclude,
        });
        const adminId = await this.getAdminId();
        this.gateway.emitTicketEvent('ticket:update', [existing.userId, adminId], ticket);
        return ticket;
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map