// src/performance/schemas/appraisal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Dispute { // BR 31, BR 32
  @Prop({ default: false }) isDisputed: boolean;
  @Prop() reason: string; // REQ-AE-07
  @Prop() resolutionNotes: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) resolvedBy: Types.ObjectId; // REQ-OD-07
}

@Schema({ _id: false })
class Rating {
  @Prop() section: string; // "Competency A"
  @Prop() score: number;
  @Prop() comment: string; // REQ-AE-04
}

@Schema({ timestamps: true })
export class Appraisal extends Document {
  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycle: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employee: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  manager: Types.ObjectId;

  @Prop({ type: [Rating], default: [] })
  ratings: Rating[];

  @Prop()
  finalScore: number;
  
  @Prop({
    type: String,
    enum: ['Pending Manager', 'Pending HR Publish', 'Published', 'Disputed', 'Closed'],
    default: 'Pending Manager',
  })
  status: string;

  @Prop({ type: Dispute, default: () => ({}) })
  dispute: Dispute;
}
export const AppraisalSchema = SchemaFactory.createForClass(Appraisal);