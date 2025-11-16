// src/employee-profile/dto/update-contact.dto.ts
import { IsString, IsOptional, IsUrl, IsEmail } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  phone?: string; // Was contactInfo.phone

  @IsOptional()
  @IsString()
  address?: string; // Was contactInfo.address

  @IsOptional()
  @IsEmail()
  personalEmail?: string; // New field from BR 2o

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}