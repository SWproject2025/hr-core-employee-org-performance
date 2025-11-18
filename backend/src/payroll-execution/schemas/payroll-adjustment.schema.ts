/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayrollAdjustment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollLineItem', required: true })
  payrollLineItemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({
    type: String,
    enum: ['CORRECTION', 'BONUS', 'DEDUCTION', 'RETROACTIVE', 'MANUAL_OVERRIDE'],
    required: true,
  })
  adjustmentType: string;

  @Prop({ required: true })
  fieldAdjusted: string;

  @Prop({ type: Types.ObjectId.Mixed, required: true })
  oldValue: any;

  @Prop({ type: Types.ObjectId.Mixed, required: true })
  newValue: any;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adjustedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  adjustedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvedAt: Date;

  @Prop({
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;
}

export const PayrollAdjustmentSchema = SchemaFactory.createForClass(PayrollAdjustment);

PayrollAdjustmentSchema.index({ payrollRunId: 1, status: 1 });
PayrollAdjustmentSchema.index({ employeeId: 1 });
PayrollAdjustmentSchema.index({ payrollLineItemId: 1 });