import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() serviceId?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @IsPositive() quantity?: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional() @IsString() addressId?: string;
  @IsOptional() @IsString() voucherCode?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() paymentMethod?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) shippingCost?: number;
}
