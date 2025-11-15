// src/performance/schemas/appraisal-cycle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AppraisalCycle extends Document { // REQ-PP-02
  @Prop({ required: true })
  name: string; // e.g., "Annual Review 2025"

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
  
  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  template: Types.ObjectId;
}
export const AppraisalCycleSchema = SchemaFactory.createForClass(AppraisalCycle);