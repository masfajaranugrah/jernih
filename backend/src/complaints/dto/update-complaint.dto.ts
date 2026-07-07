import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class UpdateComplaintDto {
  @IsOptional() @IsEnum(ComplaintStatus) status?: ComplaintStatus;
  @IsOptional() @IsString() resolution?: string;
}
