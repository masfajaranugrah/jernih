import { IsOptional, IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePromoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  bannerBg?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  promoPrice?: number;

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

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}