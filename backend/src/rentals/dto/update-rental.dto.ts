import { IsEnum, IsOptional } from 'class-validator';
import { RentalStatus } from '../../common/enums';

export class UpdateRentalDto {
  @IsOptional() @IsEnum(RentalStatus) status?: RentalStatus;
}
