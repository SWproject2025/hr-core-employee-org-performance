// src/employee-profile/schemas/employee-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class AppraisalHistory {
  @Prop() date: Date;
  @Prop() type: string;
  @Prop() score: number;
}

@Schema({ timestamps: true })
export class EmployeeProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Link to the login account

  @Prop({ required: true, unique: true })
  employeeId: string;

  // Governed Data (Requires HR Approval)
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @Prop() nationalId: string;
  @Prop() dateOfHire: Date; // BR 3b
  @Prop() contractType: string; // BR 3f

  @Prop({
    type: String,
    enum: ['Active', 'Suspended', 'On Leave', 'Terminated'], // BR 3j
    default: 'Active',
  })
  status: string;

  // Self-Service Data (Employee Can Update)
  @Prop({ type: String }) phone: string; // BR 2n
  @Prop({ type: String }) address: string; // BR 2g
  @Prop({ type: String }) bio: string; // US-E2-12
  @Prop({ type: String }) profilePictureUrl: string; // US-E2-12

  // Links to Other Modules
  @Prop({ type: Types.ObjectId, ref: 'Position' })
  position: Types.ObjectId; // Input from Organizational Structure

  @Prop({ type: [AppraisalHistory], default: [] })
  appraisalHistory: AppraisalHistory[]; // Input from Performance (BR 16)
}

export const EmployeeProfileSchema = SchemaFactory.createForClass(EmployeeProfile);