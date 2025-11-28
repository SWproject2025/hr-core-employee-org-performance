import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ collection: 'audit_logs', timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  targetEmployeeId: Types.ObjectId;

  @Prop({ required: true })
  action: string; // e.g., "UPDATE_CONTACT", "APPROVE_CHANGE_REQUEST"

  @Prop({ required: true })
  performedBy: string; // ID of the user who performed the action

  @Prop({ type: Object })
  changes: Record<string, any>; // snapshot of the changes

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);