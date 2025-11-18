import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayrollDraft extends Document {
  @Prop({ required: true, unique: true })
  draftId: string;

  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ required: true })
  payrollPeriodStart: Date;

  @Prop({ required: true })
  payrollPeriodEnd: Date;

  @Prop({ required: true, min: 1, max: 12 })
  payrollMonth: number;

  @Prop({ required: true })
  payrollYear: number;

  @Prop({ default: 0 })
  totalEmployees: number;

  @Prop({ default: 0 })
  totalGrossPay: number;

  @Prop({ default: 0 })
  totalDeductions: number;

  @Prop({ default: 0 })
  totalNetPay: number;

  @Prop({ default: 0 })
  totalPenalties: number;

  @Prop({ default: 0 })
  totalExceptions: number;

  @Prop({ default: 0 })
  missingBankDetailsCount: number;

  @Prop({ default: 0 })
  negativeNetPayCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  generatedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  generatedAt: Date;

  @Prop({
    type: String,
    enum: ['GENERATING', 'GENERATED', 'UNDER_REVIEW', 'PUBLISHED', 'DISCARDED'],
    default: 'GENERATING',
  })
  status: string;

  @Prop()
  publishedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  publishedBy: Types.ObjectId;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Types.ObjectId, ref: 'PayrollDraft' })
  previousDraftId: Types.ObjectId;

  @Prop()
  notes: string;
}

export const PayrollDraftSchema = SchemaFactory.createForClass(PayrollDraft);

PayrollDraftSchema.index({ payrollRunId: 1 });
PayrollDraftSchema.index({ status: 1 });
PayrollDraftSchema.index({ payrollMonth: 1, payrollYear: 1 });