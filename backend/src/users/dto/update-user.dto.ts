import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUrl() avatar?: string;
}
