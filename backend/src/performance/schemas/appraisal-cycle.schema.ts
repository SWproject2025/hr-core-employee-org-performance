// src/performance/schemas/appraisal-cycle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CycleStatus {
  PENDING = 'Pending',   // Not started
  ACTIVE = 'Active',     // Underway
  CLOSED = 'Closed',     // Finished
}

@Schema({ timestamps: true })
export class AppraisalCycle extends Document {
  @Prop({ required: true })
  name: string; 

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
  
  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  template: Types.ObjectId;

  // <-- IMPROVEMENT ---
  @Prop({
    type: String,
    enum: CycleStatus,
    default: CycleStatus.PENDING,
    index: true,
  })
  status: CycleStatus;
}
export const AppraisalCycleSchema = SchemaFactory.createForClass(AppraisalCycle);