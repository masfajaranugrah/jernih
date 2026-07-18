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
            name: string;
            email: string;
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
            senderId: string;
            isRead: boolean;
            ticketId: string;
        })[];
    } & {
        number: number;
        category: import(".prisma/client").$Enums.TicketCategory;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: import(".prisma/client").$Enums.TicketPriority;
        subject: string;
    }>;
    findMine(userId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            avatar: string;
        };
    } & {
        number: number;
        category: import(".prisma/client").$Enums.TicketCategory;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: import(".prisma/client").$Enums.TicketPriority;
        subject: string;
    } & {
        unreadCount: number;
    })[]>;
    findAllAdmin(adminId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            avatar: string;
        };
    } & {
        number: number;
        category: import(".prisma/client").$Enums.TicketCategory;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: import(".prisma/client").$Enums.TicketPriority;
        subject: string;
    } & {
        unreadCount: number;
    })[]>;
    private withUnreadCounts;
    findOne(ticketId: string, requesterId: string, requesterRole: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
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
            senderId: string;
            isRead: boolean;
            ticketId: string;
        })[];
    } & {
        number: number;
        category: import(".prisma/client").$Enums.TicketCategory;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: import(".prisma/client").$Enums.TicketPriority;
        subject: string;
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
        senderId: string;
        isRead: boolean;
        ticketId: string;
    }>;
    markRead(ticketId: string, readerId: string, readerRole: string): Promise<{
        message: string;
    }>;
    update(ticketId: string, dto: UpdateTicketDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            avatar: string;
        };
    } & {
        number: number;
        category: import(".prisma/client").$Enums.TicketCategory;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: import(".prisma/client").$Enums.TicketPriority;
        subject: string;
    }>;
}
