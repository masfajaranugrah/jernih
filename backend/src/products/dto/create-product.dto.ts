import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  IsBoolean, IsArray, Min, IsPositive, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// Decimal(12, 2) di PostgreSQL max = 9_999_999_999.99
// Batas aman di bawahnya:
const MAX_PRICE = 9_999_999_999;

export class CreateProductDto {
  @IsOptional() @IsString() categoryId?: string;

  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;

  @IsOptional() @IsString() description?: string;

  @Type(() => Number)
  @IsNumber() @IsPositive() @Max(MAX_PRICE, { message: `Harga maksimum adalah Rp ${MAX_PRICE.toLocaleString('id-ID')}` })
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber() @IsPositive() @Max(MAX_PRICE, { message: `Harga lama maksimum adalah Rp ${MAX_PRICE.toLocaleString('id-ID')}` })
  oldPrice?: number;

  @Type(() => Number)
  @IsNumber() @Min(0) stock: number;

  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @IsOptional() @IsBoolean() isActive?: boolean;
}
