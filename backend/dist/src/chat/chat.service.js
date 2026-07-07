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
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMessage(senderId, dto) {
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
    async getConversation(userId, otherId) {
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
        }));
        return conversations.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() -
            new Date(a.lastMessage.createdAt).getTime());
    }
    async markAsRead(userId, senderId) {
        await this.prisma.chat.updateMany({
            where: { senderId, receiverId: userId, isRead: false },
            data: { isRead: true },
        });
        return { message: 'Pesan ditandai sudah dibaca' };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map