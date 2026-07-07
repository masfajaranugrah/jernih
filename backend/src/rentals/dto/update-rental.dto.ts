import { IsEnum, IsOptional } from 'class-validator';
import { RentalStatus } from '@prisma/client';

export class UpdateRentalDto {
  @IsOptional() @IsEnum(RentalStatus) status?: RentalStatus;
}
