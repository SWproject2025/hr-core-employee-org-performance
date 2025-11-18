import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayrollException extends Document {
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollDraft', required: true })
  payrollDraftId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollLineItem' })
  payrollLineItemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({ required: true })
  employeeName: string;

  @Prop({
    type: String,
    enum: [
      'MISSING_BANK_DETAILS',
      'NEGATIVE_NET_PAY',
      'MISSING_PAY_GRADE',
      'MISSING_TAX_INFO',
      'CALCULATION_ERROR',
      'DATA_MISMATCH',
      'SALARY_SPIKE',
      'OTHER',
    ],
    required: true,
  })
  exceptionType: string;

  @Prop({
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  })
  severity: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: Date.now })
  detectedAt: Date;

  @Prop({
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED'],
    default: 'OPEN',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy: Types.ObjectId;

  @Prop()
  resolvedAt: Date;

  @Prop()
  resolutionNotes: string;

  @Prop([String])
  affectedFields: string[];

  @Prop()
  suggestedAction: string;

  @Prop({ default: false })
  autoResolved: boolean;
}

export const PayrollExceptionSchema = SchemaFactory.createForClass(PayrollException);

PayrollExceptionSchema.index({ payrollRunId: 1, status: 1 });
PayrollExceptionSchema.index({ payrollDraftId: 1 });
PayrollExceptionSchema.index({ employeeId: 1 });
PayrollExceptionSchema.index({ exceptionType: 1 });