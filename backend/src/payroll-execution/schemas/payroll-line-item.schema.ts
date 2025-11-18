import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayrollLineItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollDraft', required: true })
  payrollDraftId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({ required: true })
  employeeName: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop()
  departmentName: string;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  positionId: Types.ObjectId;

  @Prop()
  positionTitle: string;

  @Prop({
    type: String,
    enum: ['NORMAL', 'NEW_HIRE', 'RESIGNATION', 'TERMINATION'],
    default: 'NORMAL',
  })
  hrEvent: string;

  @Prop({ type: Types.ObjectId, ref: 'PayGrade', required: true })
  payGradeId: Types.ObjectId;

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

  @Prop({ type: Types.ObjectId, ref: 'SigningBonus' })
  signingBonusRecordId: Types.ObjectId;

  @Prop({ default: 0 })
  leaveCompensation: number;

  @Prop({ required: true })
  grossSalary: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  insuranceAmount: number;

  @Prop({ default: 0 })
  subtotalStatutoryDeductions: number;

  @Prop({ default: 0 })
  absencePenalty: number;

  @Prop({ default: 0 })
  latenessPenalty: number;

  @Prop({ default: 0 })
  unpaidLeaveDays: number;

  @Prop({ default: 0 })
  unpaidLeaveDeduction: number;

  @Prop({ default: 0 })
  otherPenalties: number;

  @Prop({ default: 0 })
  subtotalPenalties: number;

  @Prop({ required: true })
  netSalary: number;

  @Prop({ required: true })
  finalPaidSalary: number;

  @Prop({ default: 0 })
  resignationBenefit: number;

  @Prop({ type: Types.ObjectId, ref: 'ResignationBenefit' })
  resignationBenefitRecordId: Types.ObjectId;

  @Prop({ default: 0 })
  terminationBenefit: number;

  @Prop({ type: Types.ObjectId, ref: 'TerminationBenefit' })
  terminationBenefitRecordId: Types.ObjectId;

  @Prop({ default: 0 })
  endOfServiceBenefit: number;

  @Prop()
  bankName: string;

  @Prop()
  bankAccountNumber: string;

  @Prop()
  iban: string;

  @Prop({ default: false })
  isBankDetailsMissing: boolean;

  @Prop({ default: false })
  hasNegativeNetPay: boolean;

  @Prop({ default: false })
  isFlagged: boolean;

  @Prop()
  flagReason: string;

  @Prop([{ type: Types.ObjectId, ref: 'Attendance' }])
  attendanceRecordIds: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'LeaveRequest' }])
  leaveRecordIds: Types.ObjectId[];
}

export const PayrollLineItemSchema = SchemaFactory.createForClass(PayrollLineItem);

PayrollLineItemSchema.index({ payrollRunId: 1 });
PayrollLineItemSchema.index({ payrollDraftId: 1 });
PayrollLineItemSchema.index({ employeeId: 1 });