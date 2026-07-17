import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class SendMessageDto {
  @IsString() @IsNotEmpty() receiverId: string;

  // Boleh kosong jika pesan hanya berisi lampiran/card produk (divalidasi di service)
  @IsString() message: string;

  @IsOptional() @IsUrl({ require_tld: false }) imageUrl?: string;
  @IsOptional() @IsUrl({ require_tld: false }) videoUrl?: string;
  @IsOptional() @IsString() productId?: string;
}
