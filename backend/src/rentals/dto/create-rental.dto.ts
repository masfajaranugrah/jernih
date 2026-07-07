import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateRentalDto {
  @IsString() @IsNotEmpty() rentalItemId: string;
  @IsOptional() @IsString() mitraId?: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsOptional() @IsString() notes?: string;
}
