import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  bannerBg?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  promoPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsIn(['SCHEDULED', 'ACTIVE', 'EXPIRED', 'DISABLED'])
  status?: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'DISABLED';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quota?: number | null;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}