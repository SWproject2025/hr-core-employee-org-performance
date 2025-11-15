// src/performance/schemas/appraisal-template.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class RatingScale {
  @Prop() label: string; // e.g., "Exceeds Expectations"
  @Prop() value: number;
}

@Schema({ timestamps: true })
export class AppraisalTemplate extends Document { // REQ-PP-01
  @Prop({ required: true, unique: true })
  name: string;

  @Prop() description: string;

  @Prop([RatingScale])
  ratingScale: RatingScale[]; // BR 14

  @Prop([String]) // e.g., ["Competency A", "Goal B"]
  sections: string[];
}
export const AppraisalTemplateSchema = SchemaFactory.createForClass(AppraisalTemplate);