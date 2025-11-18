/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayrollApproval extends Document {
  @Prop({ type: Types.ObjectId, ref: 'PayrollRun', required: true })
  payrollRunId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['PAYROLL_SPECIALIST', 'PAYROLL_MANAGER', 'FINANCE_STAFF'],
    required: true,
  })
  approverRole: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  approverId: Types.ObjectId;

  @Prop({ required: true })
  approverName: string;

  @Prop({
    type: String,
    enum: ['APPROVED', 'REJECTED', 'PENDING'],
    default: 'PENDING',
  })
  action: string;

  @Prop()
  actionDate: Date;

  @Prop()
  comments: string;

  @Prop()
  rejectionReason: string;

  @Prop({ required: true })
  approvalLevel: number;

  @Prop()
  notifiedAt: Date;

  @Prop()
  reminderSentAt: Date;
}

export const PayrollApprovalSchema = SchemaFactory.createForClass(PayrollApproval);

PayrollApprovalSchema.index({ payrollRunId: 1 });
PayrollApprovalSchema.index({ approverRole: 1, action: 1 });
PayrollApprovalSchema.index({ approverId: 1 });