import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    send(req: any, dto: SendMessageDto): Promise<{
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
        createdAt: Date;
        message: string;
        imageUrl: string | null;
        isRead: boolean;
        senderId: string;
        receiverId: string;
        videoUrl: string | null;
        productId: string | null;
        isDeleted: boolean;
    }>;
    inbox(req: any): Promise<{
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
            createdAt: Date;
            message: string;
            imageUrl: string | null;
            isRead: boolean;
            senderId: string;
            receiverId: string;
            videoUrl: string | null;
            productId: string | null;
            isDeleted: boolean;
        };
        unreadCount: number;
    }[]>;
    adminId(): Promise<{
        id: string;
        name: string;
        avatar: string;
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    conversation(req: any, partnerId: string): Promise<({
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
        createdAt: Date;
        message: string;
        imageUrl: string | null;
        isRead: boolean;
        senderId: string;
        receiverId: string;
        videoUrl: string | null;
        productId: string | null;
        isDeleted: boolean;
    })[]>;
    markRead(req: any, senderId: string): Promise<{
        message: string;
    }>;
}
