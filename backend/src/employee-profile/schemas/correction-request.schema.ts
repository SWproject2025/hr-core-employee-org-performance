// src/employee-profile/schemas/correction-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Schema({ timestamps: true })
export class CorrectionRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employee: Types.ObjectId;

  @Prop({ required: true })
  fieldToChange: string; // e.g., "jobTitle", "nationalId"

  @Prop({ required: true })
  newValue: string;

  @Prop() justification: string;

  @Prop({ type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy: Types.ObjectId; // The HR admin who actioned it
}

export const CorrectionRequestSchema = SchemaFactory.createForClass(CorrectionRequest);