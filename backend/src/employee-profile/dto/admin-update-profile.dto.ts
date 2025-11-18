// src/employee-profile/dto/admin-update-profile.dto.ts
import { IsString, IsOptional, IsEmail, IsEnum, IsMongoId } from 'class-validator';

// This enum must match your schema
export enum EmployeeStatus {
  ACTIVE = 'Active',
  SUSPENDED = 'Suspended',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated',
}

export class AdminUpdateProfileDto {
  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsString()
  employeeId?: string;

  @IsOptional() @IsString()
  nationalId?: string;

  // You can also update the flattened self-service fields
  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsEmail()
  personalEmail?: string;

  // --- Governed Data ---
  @IsOptional()
  @IsEnum(EmployeeStatus) // Use enum for validation
  status?: EmployeeStatus;

  @IsOptional() @IsString()
  contractType?: string;

  @IsOptional()
  @IsMongoId() // Validate that it's a MongoDB ObjectId
  position?: string; // Admin can change the employee's position
}