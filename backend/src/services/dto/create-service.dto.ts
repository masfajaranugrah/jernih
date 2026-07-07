import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsNumber() @IsPositive() priceFrom: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
}
