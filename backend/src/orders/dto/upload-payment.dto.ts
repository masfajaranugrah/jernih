import { IsString, IsNotEmpty } from 'class-validator';

export class UploadPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'URL bukti pembayaran wajib diisi' })
  paymentProof: string;
}
