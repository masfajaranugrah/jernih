import { IsString, IsOptional, IsBoolean, IsUrl, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateHeroBannerDto {
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() titleSuffix?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() ctaText?: string;
  @IsOptional() @IsString() ctaColor?: string;
  @IsOptional() @IsString() ctaTextColor?: string;
  @IsOptional() @IsString() bgColor?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsString() linkHref?: string;
  @IsOptional() @IsString() align?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
