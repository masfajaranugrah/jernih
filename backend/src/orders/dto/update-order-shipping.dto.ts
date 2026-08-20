// orders/dto/update-order-shipping.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateOrderShippingDto {
  @IsString()
  @IsNotEmpty({ message: 'addressId wajib diisi' })
  addressId: string;

  @IsString()
  @IsNotEmpty({ message: 'courier wajib diisi' })
  courier: string;

  @IsString()
  @IsNotEmpty({ message: 'service wajib diisi' })
  service: string;
}