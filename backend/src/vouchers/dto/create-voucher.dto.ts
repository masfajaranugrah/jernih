import {
  IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional,
  IsBoolean, IsPositive, Min, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VoucherType } from '@prisma/client';

export class CreateVoucherDto {
  @IsString() @IsNotEmpty() code: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(VoucherType) type: VoucherType;
  @Type(() => Number) @IsNumber() @IsPositive() value: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPurchase?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @IsPositive() maxDiscount?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @IsPositive() quota?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}
