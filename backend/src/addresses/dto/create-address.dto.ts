import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsOptional() @IsString() label?: string;
  @IsString() @IsNotEmpty() recipient: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() street: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() province: string;
  @IsString() @IsNotEmpty() postalCode: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
