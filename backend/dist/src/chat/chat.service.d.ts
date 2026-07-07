import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
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
    } & {
        id: string;
        createdAt: Date;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        senderId: string;
        isRead: boolean;
    }>;
    getConversation(userId: string, otherId: string): Promise<({
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        senderId: string;
        isRead: boolean;
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
        } & {
            id: string;
            createdAt: Date;
            receiverId: string;
            message: string;
            imageUrl: string | null;
            senderId: string;
            isRead: boolean;
        };
        unreadCount: number;
    }[]>;
    markAsRead(userId: string, senderId: string): Promise<{
        message: string;
    }>;
}
