import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefundDocument = HydratedDocument<Refund>;

@Schema({ timestamps: true })
export class Refund {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayrollDispute' })
  relatedDisputeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ReimbursementClaim' })
  relatedClaimId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: ['Pending', 'Processed', 'AddedToNextPayroll'],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy: Types.ObjectId;

  @Prop()
  processedAt: Date;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);