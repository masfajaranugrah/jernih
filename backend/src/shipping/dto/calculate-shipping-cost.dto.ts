// shipping/dto/calculate-shipping-cost.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateShippingCostDto {
  @IsString()
  @IsNotEmpty({ message: 'addressId wajib diisi' })
  addressId: string;

  /**
   * Opsional — backend memakai berat default (1 kg = 1000 gram) untuk tahap awal.
   * Field ini diterima agar mudah diganti menjadi totalWeight dari cart nanti.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50000)
  weight?: number;

  /** Opsional — default 'jne' (JNE). Struktur mendukung kurir lain (jnt, sicepat, dll). */
  @IsOptional()
  @IsString()
  courier?: string;
}