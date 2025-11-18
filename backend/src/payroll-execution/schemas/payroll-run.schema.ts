import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayrollRun extends Document {
  @Prop({ required: true, unique: true })
  runId: string;

  @Prop({ required: true })
  payrollPeriodStart: Date;

  @Prop({ required: true })
  payrollPeriodEnd: Date;

  @Prop({ required: true, min: 1, max: 12 })
  payrollMonth: number;

  @Prop({ required: true })
  payrollYear: number;

  @Prop({
    type: String,
    enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PENDING_REVIEW',
  })
  periodReviewStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  periodReviewedBy: Types.ObjectId;

  @Prop()
  periodReviewedAt: Date;

  @Prop()
  periodRejectionReason: string;

  @Prop({
    type: String,
    enum: [
      'PENDING_PERIOD_REVIEW',
      'PERIOD_APPROVED',
      'GENERATING_DRAFT',
      'UNDER_REVIEW',
      'PUBLISHED_FOR_APPROVAL',
      'PENDING_PAYROLL_MANAGER',
      'PENDING_FINANCE',
      'FROZEN',
      'PAID',
      'REJECTED',
    ],
    default: 'PENDING_PERIOD_REVIEW',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  initiatedBy: Types.ObjectId;

  @Prop()
  initiatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  frozenBy: Types.ObjectId;

  @Prop()
  frozenAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  unfrozenBy: Types.ObjectId;

  @Prop()
  unfrozenAt: Date;

  @Prop()
  unfreezeJustification: string;

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

  @Prop({ default: false })
  isPeriodEdited: boolean;

  @Prop()
  originalPeriodStart: Date;

  @Prop()
  originalPeriodEnd: Date;

  @Prop([String])
  departmentsIncluded: string[];

  @Prop({ default: false })
  hasExceptions: boolean;

  @Prop()
  executedAt: Date;

  @Prop()
  notes: string;
}

export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);

PayrollRunSchema.index({ runId: 1 });
PayrollRunSchema.index({ status: 1 });
PayrollRunSchema.index({ payrollMonth: 1, payrollYear: 1 });