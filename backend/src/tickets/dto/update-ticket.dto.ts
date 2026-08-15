import { IsEnum, IsOptional } from 'class-validator';
import { TicketPriority, TicketStatus } from '../../common/enums';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus, { message: 'Status tidak valid' })
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority, { message: 'Prioritas tidak valid' })
  priority?: TicketPriority;
}
