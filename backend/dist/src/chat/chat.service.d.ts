import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';
export declare class ChatService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: ChatGateway);
    private sanitize;
    sendMessage(senderId: string, dto: SendMessageDto): Promise<{
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
        receiver: {
            id: string;
            name: string;
            avatar: string;
        };
        product: {
            id: string;
            name: string;
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            images: string[];
        };
    } & {
        id: string;
        senderId: string;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        videoUrl: string | null;
        productId: string | null;
        isDeleted: boolean;
        isRead: boolean;
        createdAt: Date;
    }>;
    getConversation(userId: string, otherId: string): Promise<({
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
        receiver: {
            id: string;
            name: string;
            avatar: string;
        };
        product: {
            id: string;
            name: string;
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            images: string[];
        };
    } & {
        id: string;
        senderId: string;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        videoUrl: string | null;
        productId: string | null;
        isDeleted: boolean;
        isRead: boolean;
        createdAt: Date;
    })[]>;
    getInbox(userId: string): Promise<{
        lastMessage: {
            sender: {
                id: string;
                name: string;
                avatar: string;
            };
            receiver: {
                id: string;
                name: string;
                avatar: string;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                price: import("@prisma/client/runtime/library").Decimal;
                images: string[];
            };
        } & {
            id: string;
            senderId: string;
            receiverId: string;
            message: string;
            imageUrl: string | null;
            videoUrl: string | null;
            productId: string | null;
            isDeleted: boolean;
            isRead: boolean;
            createdAt: Date;
        };
        unreadCount: number;
    }[]>;
    markAsRead(userId: string, senderId: string): Promise<{
        message: string;
    }>;
    getAdminId(): Promise<{
        id: string;
        name: string;
        avatar: string;
    }>;
    deleteMessage(userId: string, messageId: string): Promise<{
        message: string;
    }>;
    private deleteUploadedFile;
}
