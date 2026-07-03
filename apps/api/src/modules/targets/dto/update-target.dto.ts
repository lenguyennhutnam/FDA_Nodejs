import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTargetDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}
