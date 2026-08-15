import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '../../common/enums';

export class UpdateComplaintDto {
  @IsOptional() @IsEnum(ComplaintStatus) status?: ComplaintStatus;
  @IsOptional() @IsString() resolution?: string;
}
