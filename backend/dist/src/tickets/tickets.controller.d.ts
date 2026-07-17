import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendTicketMessageDto } from './dto/send-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    create(req: any, dto: CreateTicketDto): Promise<{
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
    mine(req: any): Promise<({
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
    all(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    addMessage(req: any, id: string, dto: SendTicketMessageDto): Promise<{
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
    markRead(req: any, id: string): Promise<{
        message: string;
    }>;
    update(id: string, dto: UpdateTicketDto): Promise<{
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
