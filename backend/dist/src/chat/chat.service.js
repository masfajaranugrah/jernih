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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_gateway_1 = require("./chat.gateway");
const messageInclude = {
    sender: { select: { id: true, name: true, avatar: true } },
    receiver: { select: { id: true, name: true, avatar: true } },
    product: {
        select: { id: true, name: true, slug: true, price: true, images: true },
    },
};
let ChatService = class ChatService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    sanitize(msg) {
        if (!msg || !msg.isDeleted)
            return msg;
        return {
            ...msg,
            message: '',
            imageUrl: null,
            videoUrl: null,
            productId: null,
            product: null,
        };
    }
    async sendMessage(senderId, dto) {
        const sender = await this.prisma.user.findUnique({
            where: { id: senderId },
            select: { role: true },
        });
        if (!sender)
            throw new common_1.NotFoundException('Pengirim tidak ditemukan');
        let receiverId = dto.receiverId;
        if (sender.role !== 'ADMIN') {
            const admin = await this.getAdminId();
            receiverId = admin.id;
        }
        if (senderId === receiverId) {
            throw new common_1.BadRequestException('Tidak bisa mengirim pesan ke diri sendiri');
        }
        const hasContent = dto.message.trim() !== '' || dto.imageUrl || dto.videoUrl || dto.productId;
        if (!hasContent) {
            throw new common_1.BadRequestException('Pesan tidak boleh kosong');
        }
        if (dto.productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: dto.productId },
                select: { id: true },
            });
            if (!product)
                throw new common_1.NotFoundException('Produk tidak ditemukan');
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
    async sendSystemMessage(adminId, body) {
        if (!body.message)
            throw new common_1.BadRequestException('Pesan tidak boleh kosong');
        let receiverId = body.receiverId;
        if (!receiverId) {
            const admin = await this.prisma.user.findUnique({
                where: { id: adminId },
                select: { role: true },
            });
            receiverId = adminId;
        }
        const msg = await this.prisma.chat.create({
            data: {
                senderId: adminId,
                receiverId,
                message: body.message,
                isSystem: true,
            },
            include: { sender: { select: { id: true, name: true, avatar: true } } },
        });
        try {
            const gateway = this.getGateway();
            if (gateway) {
                gateway.emitNewMessage({
                    senderId: adminId,
                    receiverId,
                    message: body.message,
                    id: msg.id,
                    isSystem: true,
                    createdAt: msg.createdAt,
                });
            }
        }
        catch { }
        return msg;
    }
    getGateway() {
        try {
            const { ChatGateway } = require('./chat.gateway');
            return ChatGateway?.instance;
        }
        catch {
            return null;
        }
    }
    async getConversation(userId, otherId) {
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
    async getInbox(userId) {
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
        const conversations = await Promise.all(partnerIds.map(async (partnerId) => {
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
        }));
        return conversations.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() -
            new Date(a.lastMessage.createdAt).getTime());
    }
    async markAsRead(userId, senderId) {
        await this.prisma.chat.updateMany({
            where: { senderId, receiverId: userId, isRead: false },
            data: { isRead: true },
        });
        this.gateway.emitRead(userId, senderId);
        return { message: 'Pesan ditandai sudah dibaca' };
    }
    async getAdminId() {
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN', isActive: true },
            select: { id: true, name: true, avatar: true },
        });
        if (!admin)
            throw new common_1.NotFoundException('Admin tidak ditemukan');
        return admin;
    }
    async deleteMessage(userId, messageId) {
        const msg = await this.prisma.chat.findUnique({ where: { id: messageId } });
        if (!msg)
            throw new common_1.NotFoundException('Pesan tidak ditemukan');
        if (msg.senderId !== userId) {
            throw new common_1.ForbiddenException('Hanya pengirim yang bisa menghapus pesan');
        }
        if (msg.isDeleted)
            return { message: 'Pesan sudah dihapus' };
        await Promise.all([msg.imageUrl, msg.videoUrl].map((url) => this.deleteUploadedFile(url)));
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
    async deleteUploadedFile(url) {
        if (!url)
            return;
        try {
            const pathname = new URL(url).pathname;
            if (!pathname.startsWith('/uploads/'))
                return;
            const name = (0, path_1.basename)(pathname);
            if (!name || name.includes('..') || name.includes('/'))
                return;
            await fs_1.promises.unlink((0, path_1.join)(process.cwd(), 'public', 'uploads', name));
        }
        catch {
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway])
], ChatService);
//# sourceMappingURL=chat.service.js.map