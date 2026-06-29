import { IsArray, IsString, IsOptional, ArrayNotEmpty } from 'class-validator';

export class LabelDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  urls!: string[];

  /** "irrelevant" để đánh dấu không liên quan; "" hoặc bỏ trống để khôi phục. */
  @IsString()
  @IsOptional()
  label?: string;
}
