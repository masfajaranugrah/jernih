import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateMitraDto {
  @IsString() @IsNotEmpty() storeName: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() logo?: string;
  @IsOptional() @IsUrl() banner?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() province?: string;
}
