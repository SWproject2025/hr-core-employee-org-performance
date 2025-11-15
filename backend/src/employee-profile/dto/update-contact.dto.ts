// src/employee-profile/dto/update-contact.dto.ts
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateContactDto {
  @IsOptional() @IsString()
  phone?: string; // US-E2-05

  @IsOptional() @IsString()
  address?: string; // US-E2-05

  @IsOptional() @IsString()
  bio?: string; // US-E2-12

  @IsOptional() @IsUrl()
  profilePictureUrl?: string; // US-E2-12
}