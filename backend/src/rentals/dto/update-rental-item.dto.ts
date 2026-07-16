import { PartialType } from '@nestjs/mapped-types';
import { CreateRentalItemDto } from './create-rental-item.dto';
export class UpdateRentalItemDto extends PartialType(CreateRentalItemDto) {}
