import { TicketPriority, TicketStatus } from '@prisma/client';
export declare class UpdateTicketDto {
    status?: TicketStatus;
    priority?: TicketPriority;
}
