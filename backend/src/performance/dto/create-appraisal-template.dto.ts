import {
  AppraisalRatingScaleType,
  AppraisalTemplateType,
} from '../enums/performance.enums';

export class RatingScaleDefinitionDto {
  type: AppraisalRatingScaleType;
  min: number;
  max: number;
}

export class EvaluationCriterionDto {
  key: string;
  title: string;
  details?: string;
  weight?: number;   // 0–100
  maxScore?: number;
  required?: boolean;
}

export class CreateAppraisalTemplateDto {
  name: string;
  description?: string;

  templateType: AppraisalTemplateType;

  ratingScale: RatingScaleDefinitionDto;

  criteria: EvaluationCriterionDto[];

  instructions?: string;

  // Mongo ObjectIds as strings – Mongoose will cast
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];

  isActive?: boolean;
}
