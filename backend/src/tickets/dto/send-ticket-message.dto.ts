import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class SendTicketMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
