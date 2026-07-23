import { IsString, IsNotEmpty } from 'class-validator';

export class SaveSettingDto {
  @IsString() @IsNotEmpty() value: string;
}
