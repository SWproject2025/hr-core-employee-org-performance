// src/performance/dto/submit-manager-rating.dto.ts
import { IsArray, IsString, IsNumber, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer'; // Required for nested validation

/**
 * This class defines the shape of a single rating object.
 * It matches the 'Rating' sub-schema.
 */
export class RatingDto {
  @IsString()
  @IsNotEmpty()
  section: string; // e.g., "Competency A"

  @IsNumber()
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

/**
 * This is the main DTO for the request body.
 * It contains the full array of ratings.
 */
export class SubmitManagerRatingDto {
  @IsArray()
  // These two decorators are crucial for validating an array of objects
  @ValidateNested({ each: true })
  @Type(() => RatingDto)
  ratings: RatingDto[];
}