import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TerminationBenefit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({ required: true })
  employeeName: string;

  @Prop({ required: true })
  terminationDate: Date;

  @Prop({ required: true })
  terminationReason: string;

  @Prop({
    type: String,
    enum: ['WITH_CAUSE', 'WITHOUT_CAUSE', 'MUTUAL_AGREEMENT', 'LAYOFF'],
    required: true,
  })
  terminationType: string;

  @Prop({ required: true })
  yearsOfService: number;

  @Prop({ default: 0 })
  endOfServiceBenefit: number;

  @Prop({ default: 0 })
  unusedLeaveEncashment: number;

  @Prop({ default: 0 })
  severancePay: number;

  @Prop({ default: 0 })
  noticePeriodPay: number;

  @Prop({ default: 0 })
  otherBenefits: number;

  @Prop({ required: true })
  totalBenefit: number;

  @Prop({ default: 0 })
  advanceSalaryDeduction: number;

  @Prop({ default: 0 })
  loanDeduction: number;

  @Prop({ default: 0 })
  damageCompensation: number;

  @Prop({ default: 0 })
  otherDeductions: number;

  @Prop({ default: 0 })
  totalDeductions: number;

  @Prop({ required: true })
  netBenefitAmount: number;

  @Prop({
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  calculatedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  calculatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  rejectedBy: Types.ObjectId;

  @Prop()
  rejectedAt: Date;

  @Prop()
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'PayrollRun' })
  processedInPayrollRun: Types.ObjectId;

  @Prop()
  processedAt: Date;

  @Prop()
  notes: string;
}

export const TerminationBenefitSchema = SchemaFactory.createForClass(TerminationBenefit);

TerminationBenefitSchema.index({ employeeId: 1 });
TerminationBenefitSchema.index({ status: 1 });
TerminationBenefitSchema.index({ terminationDate: 1 });