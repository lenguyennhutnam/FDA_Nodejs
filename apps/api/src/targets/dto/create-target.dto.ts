import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTargetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}
