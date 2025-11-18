import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PayrollDisputeDocument = HydratedDocument<PayrollDispute>;

@Schema({ timestamps: true })
export class PayrollDispute {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payslip', required: true })
  payslipId: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @Prop()
  hrComment: string;

  @Prop()
  payrollManagerComment: string;
}

export const PayrollDisputeSchema =
  SchemaFactory.createForClass(PayrollDispute);