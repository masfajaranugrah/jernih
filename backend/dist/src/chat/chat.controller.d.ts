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
    } & {
        id: string;
        createdAt: Date;
        senderId: string;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        isRead: boolean;
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
        } & {
            id: string;
            createdAt: Date;
            senderId: string;
            receiverId: string;
            message: string;
            imageUrl: string | null;
            isRead: boolean;
        };
        unreadCount: number;
    }[]>;
    conversation(req: any, partnerId: string): Promise<({
        sender: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        senderId: string;
        receiverId: string;
        message: string;
        imageUrl: string | null;
        isRead: boolean;
    })[]>;
    markRead(req: any, senderId: string): Promise<{
        message: string;
    }>;
}
