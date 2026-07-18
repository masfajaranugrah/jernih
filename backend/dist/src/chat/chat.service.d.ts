import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';
export declare class ChatService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: ChatGateway);
    private sanitize;
    sendMessage(senderId: string, dto: SendMessageDto): Promise<{
        product: {
            id: string;
            name: string;
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            images: string[];
        };
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
    } & {
        id: string;
        createdAt: Date;
        productId: string | null;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        videoUrl: string | null;
        senderId: string;
        isDeleted: boolean;
        isRead: boolean;
        isSystem: boolean;
    }>;
    sendSystemMessage(adminId: string, body: {
        message: string;
        type?: string;
        orderNumber?: string;
        receiverId?: string;
    }): Promise<{
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string | null;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        videoUrl: string | null;
        senderId: string;
        isDeleted: boolean;
        isRead: boolean;
        isSystem: boolean;
    }>;
    private getGateway;
    getConversation(userId: string, otherId: string): Promise<({
        product: {
            id: string;
            name: string;
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            images: string[];
        };
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
    } & {
        id: string;
        createdAt: Date;
        productId: string | null;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        videoUrl: string | null;
        senderId: string;
        isDeleted: boolean;
        isRead: boolean;
        isSystem: boolean;
    })[]>;
    getInbox(userId: string): Promise<{
        lastMessage: {
            product: {
                id: string;
                name: string;
                slug: string;
                price: import("@prisma/client/runtime/library").Decimal;
                images: string[];
            };
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
        } & {
            id: string;
            createdAt: Date;
            productId: string | null;
            receiverId: string;
            message: string;
            imageUrl: string | null;
            videoUrl: string | null;
            senderId: string;
            isDeleted: boolean;
            isRead: boolean;
            isSystem: boolean;
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
