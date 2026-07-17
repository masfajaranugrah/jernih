import { TicketCategory, TicketPriority } from '@prisma/client';
export declare class CreateTicketDto {
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
}
