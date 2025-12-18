import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateChangeRequestDto {
  @IsNotEmpty()
  @IsObject()
  changes: Record<string, any>;

  @IsOptional()
  @IsString()
  reason?: string;
}