import { IsOptional, IsString } from 'class-validator';

export class SendTicketMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
