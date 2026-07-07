import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class SendMessageDto {
  @IsString() @IsNotEmpty() receiverId: string;
  @IsString() @IsNotEmpty() message: string;
  @IsOptional() @IsUrl() imageUrl?: string;
}
