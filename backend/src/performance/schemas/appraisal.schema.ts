// src/performance/schemas/appraisal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// --- SUB-DOCUMENT FOR DISPUTES ---
@Schema({ _id: false })
export class Dispute {
  @Prop({ required: true })
  reason: string;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({
    type: String,
    enum: ['Pending', 'Resolved', 'Rejected'],
    default: 'Pending',
  })
  status: string;
}
export const DisputeSchema = SchemaFactory.createForClass(Dispute);

// --- NEW SUB-DOCUMENT FOR RATINGS ---
@Schema({ _id: false })
export class Rating {
  @Prop({ required: true })
  section: string; // e.g., "Competency A"

  @Prop({ required: true })
  score: number;

  @Prop({ type: String, default: '' })
  comment: string; // REQ-AE-04
}
export const RatingSchema = SchemaFactory.createForClass(Rating);


@Schema({ timestamps: true })
export class Appraisal extends Document {
  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true, index: true }) // <-- IMPROVEMENT
  cycle: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true }) // <-- IMPROVEMENT
  employee: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true }) // <-- IMPROVEMENT
  manager: Types.ObjectId;

  // --- CRITICAL FIX ---
  // Changed from a Map to a proper array of sub-documents
  @Prop({ type: [RatingSchema], default: [] })
  ratings: Rating[];

  @Prop()
  finalScore: number;
  
  @Prop({
    type: String,
    enum: ['Pending Manager', 'Pending HR Publish', 'Published', 'Disputed', 'Closed'],
    default: 'Pending Manager',
    index: true, // <-- IMPROVEMENT
  })
  status: string;

  @Prop({ type: DisputeSchema, default: () => ({}) })
  dispute: Dispute;
}
export const AppraisalSchema = SchemaFactory.createForClass(Appraisal);
