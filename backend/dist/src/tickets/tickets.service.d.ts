import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendTicketMessageDto } from './dto/send-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: ChatGateway);
    private getAdminId;
    create(userId: string, dto: CreateTicketDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
        messages: ({
            sender: {
                id: string;
                name: string;
                avatar: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            imageUrl: string | null;
            isRead: boolean;
            senderId: string;
            ticketId: string;
        })[];
    } & {
        number: number;
        id: string;
        userId: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        priority: import(".prisma/client").$Enums.TicketPriority;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findMine(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
    } & {
        number: number;
        id: string;
        userId: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        priority: import(".prisma/client").$Enums.TicketPriority;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        createdAt: Date;
        updatedAt: Date;
    } & {
        unreadCount: number;
    })[]>;
    findAllAdmin(adminId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
    } & {
        number: number;
        id: string;
        userId: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        priority: import(".prisma/client").$Enums.TicketPriority;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        createdAt: Date;
        updatedAt: Date;
    } & {
        unreadCount: number;
    })[]>;
    private withUnreadCounts;
    findOne(ticketId: string, requesterId: string, requesterRole: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
        messages: ({
            sender: {
                id: string;
                name: string;
                avatar: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            message: string;
            imageUrl: string | null;
            isRead: boolean;
            senderId: string;
            ticketId: string;
        })[];
    } & {
        number: number;
        id: string;
        userId: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        priority: import(".prisma/client").$Enums.TicketPriority;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addMessage(ticketId: string, senderId: string, senderRole: string, dto: SendTicketMessageDto): Promise<{
        sender: {
            id: string;
            name: string;
            avatar: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        message: string;
        imageUrl: string | null;
        isRead: boolean;
        senderId: string;
        ticketId: string;
    }>;
    markRead(ticketId: string, readerId: string, readerRole: string): Promise<{
        message: string;
    }>;
    update(ticketId: string, dto: UpdateTicketDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
    } & {
        number: number;
        id: string;
        userId: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        priority: import(".prisma/client").$Enums.TicketPriority;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
