import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReimbursementClaimDocument = HydratedDocument<ReimbursementClaim>;

@Schema({ timestamps: true })
export class ReimbursementClaim {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  expenseType: string; // e.g., Travel, Supplies

  @Prop({ required: true })
  amount: number;

  @Prop()
  receiptUrl: string;

  @Prop()
  notes: string;

  @Prop({
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  })
  status: string;

  @Prop()
  payrollManagerComment: string;

  @Prop()
  financeComment: string;
}

export const ReimbursementClaimSchema =
  SchemaFactory.createForClass(ReimbursementClaim);