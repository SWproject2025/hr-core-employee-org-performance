import { IsString, IsOptional, IsDate, IsEnum } from 'class-validator';

export class AdminUpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsDate()
  @IsOptional()
  dateOfHire?: Date;

  @IsString()
  @IsOptional()
  contractType?: string;

  @IsEnum(['Active', 'Suspended', 'On Leave', 'Terminated'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;
}

