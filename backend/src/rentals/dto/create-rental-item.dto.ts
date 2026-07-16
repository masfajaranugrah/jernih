import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsPositive, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRentalItemDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsNumber() @IsPositive() pricePerDay: number;
  @IsOptional() @Type(() => Number) @IsNumber() @IsPositive() deposit?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsBoolean() isActive?: boolean;
}
