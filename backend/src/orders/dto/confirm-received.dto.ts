import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class ConfirmReceivedReviewDto {
  @IsString()
  orderItemId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class ConfirmReceivedDto {
  @IsString()
  @IsNotEmpty({ message: 'Bukti penerimaan wajib diupload' })
  @MaxLength(2000)
  receivedProof: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConfirmReceivedReviewDto)
  reviews: ConfirmReceivedReviewDto[];
}
