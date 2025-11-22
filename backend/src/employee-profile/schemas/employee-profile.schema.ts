// src/employee-profile/schemas/employee-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ... (AppraisalHistory sub-document remains the same) ...

@Schema({ timestamps: true })
export class EmployeeProfile extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // <-- IMPROVEMENT: Enforce 1-to-1
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true, // <-- IMPROVEMENT: Faster search
  })
  employeeId: string;

  // ... (firstName, lastName, etc. remain the same) ...

  @Prop({
    type: String,
    enum: ['Active', 'Suspended', 'On Leave', 'Terminated'],
    default: 'Active',
    index: true, // <-- IMPROVEMENT: Faster filtering by status
  })
  status: string;
  
  // --- IMPROVED Self-Service Data ---
  @Prop({ type: String })
  phone: string; // BR 2n

  @Prop({ type: String })
  address: string; // BR 2g

  @Prop({ type: String, unique: true, sparse: true, lowercase: true })
  personalEmail: string; // BR 2o (sparse index allows multiple nulls)

  @Prop({ type: String })
  bio: string; // US-E2-12

  @Prop({ type: String })
  profilePictureUrl: string; // US-E2-12

  // --- Links to Other Modules ---
  @Prop({ type: Types.ObjectId, ref: 'Position', index: true }) // <-- IMPROVEMENT
  position: Types.ObjectId;

  @Prop({ type: [AppraisalHistory], default: [] })
  appraisalHistory: AppraisalHistory[];
}

export const EmployeeProfileSchema = SchemaFactory.createForClass(EmployeeProfile);