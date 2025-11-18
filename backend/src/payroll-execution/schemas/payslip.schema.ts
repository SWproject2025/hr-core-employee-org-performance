import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class Earnings {
  @Prop({ required: true })
  baseSalary: number;

  @Prop({ default: 0 })
  housingAllowance: number;

  @Prop({ default: 0 })
  transportationAllowance: number;

  @Prop({ default: 0 })
  otherAllowances: number;

  @Prop({ default: 0 })
  signingBonus: number;

  @Prop({ default: 0 })
  leaveCompensation: number;

  @Prop({ default: 0 })
  overtimePay: number;

  @Prop({ required: true })
  totalEarnings: number;
}

class Deductions {
  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  insuranceAmount: number;

  @Prop({ default: 0 })
  subtotalStatutoryDeductions: number;
}

class Penalties {
  @Prop({ default: 0 })
  absencePenalty: number;

  @Prop({ default: 0 })
  latenessPenalty: number;

  @Prop({ default: 0 })
  unpaidLeaveDeduction: number;

  @Prop({ default: 0 })
  otherPenalties: number;

  @Prop({ default: 0 })
  subtotalPenalties: number;
}

@Schema({ timestamps: true })
export class Payslip extends Document {
  @Prop({ required: true, unique: true })
  payslipNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollLineItem', required: true })
  payrollLineItemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({ required: true })
  employeeName: string;

  @Prop({ required: true })
  payrollMonth: number;

  @Prop({ required: true })
  payrollYear: number;

  @Prop()
  paymentDate: Date;

  @Prop({ type: Earnings, required: true })
  earnings: Earnings;

  @Prop({ type: Deductions, required: true })
  deductions: Deductions;

  @Prop({ type: Penalties, required: true })
  penalties: Penalties;

  @Prop({ required: true })
  grossSalary: number;

  @Prop({ required: true })
  netSalary: number;

  @Prop({ required: true })
  finalPaidAmount: number;

  @Prop({
    type: String,
    enum: ['GENERATED', 'SENT', 'VIEWED', 'DOWNLOADED'],
    default: 'GENERATED',
  })
  status: string;

  @Prop({ default: Date.now })
  generatedAt: Date;

  @Prop()
  sentAt: Date;

  @Prop()
  viewedAt: Date;

  @Prop()
  downloadedAt: Date;

  @Prop()
  pdfUrl: string;

  @Prop()
  notes: string;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);

PayslipSchema.index({ payrollRunId: 1 });
PayslipSchema.index({ employeeId: 1 });
PayslipSchema.index({ payrollMonth: 1, payrollYear: 1 });
PayslipSchema.index({ payslipNumber: 1 });