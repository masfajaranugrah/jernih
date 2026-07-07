import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateComplaintDto {
  @IsOptional() @IsString() mitraId?: string;
  @IsOptional() @IsString() orderId?: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
}
