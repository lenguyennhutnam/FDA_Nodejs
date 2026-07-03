import { IsArray, IsString, IsOptional, ArrayNotEmpty } from 'class-validator';

export class LabelDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  urls!: string[];

  @IsString()
  @IsOptional()
  label?: string;
}
