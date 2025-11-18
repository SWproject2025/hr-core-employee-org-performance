import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCorrectionRequestDto {
  @IsString()
  @IsNotEmpty()
  fieldToChange: string; // e.g., "jobTitle", "nationalId"

  @IsString()
  @IsNotEmpty()
  newValue: string;

  @IsString()
  @IsOptional()
  justification?: string;
}

