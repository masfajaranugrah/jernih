import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TicketCategory, TicketPriority } from '../../common/enums';

export class CreateTicketDto {
  @IsEnum(TicketCategory, { message: 'Kategori tidak valid' })
  category: TicketCategory;

  @IsEnum(TicketPriority, { message: 'Prioritas tidak valid' })
  priority: TicketPriority;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi kendala tidak boleh kosong' })
  description: string;
}
