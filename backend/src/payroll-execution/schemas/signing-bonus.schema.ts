import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SigningBonus extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({ required: true })
  employeeName: string;

  @Prop({ required: true, min: 0 })
  bonusAmount: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  requestedAt: Date;

  @Prop({
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'],
    default: 'PENDING',
  })
  status: string;

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

export const SigningBonusSchema = SchemaFactory.createForClass(SigningBonus);

SigningBonusSchema.index({ employeeId: 1 });
SigningBonusSchema.index({ status: 1 });
SigningBonusSchema.index({ effectiveDate: 1 });
