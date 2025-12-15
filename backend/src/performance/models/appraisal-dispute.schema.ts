import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AppraisalDisputeStatus } from '../enums/performance.enums';

export type AppraisalDisputeDocument = HydratedDocument<AppraisalDispute>;

@Schema({ collection: 'appraisal_disputes', timestamps: true })
export class AppraisalDispute {
  // NOTE: You don't need to define _id manually; Mongoose creates it by default.
  // Keeping it out avoids duplicate/odd behavior.

  @Prop({ type: Types.ObjectId, ref: 'AppraisalAssignment', required: true })
  assignmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: Types.ObjectId;

  // These two match what your service sets:
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  managerProfileId: Types.ObjectId;

  // Matches service: appraisalRecordId
  @Prop({ type: Types.ObjectId, ref: 'AppraisalRecord', required: true })
  appraisalRecordId: Types.ObjectId;

  // Matches service: raisedByEmployeeProfileId
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  raisedByEmployeeProfileId: Types.ObjectId;

  @Prop({ type: String, required: true })
  reason: string;

  // Matches service: employeeComments
  @Prop({ type: String })
  employeeComments?: string;

  @Prop({
    type: String,
    enum: Object.values(AppraisalDisputeStatus),
    default: AppraisalDisputeStatus.OPEN,
  })
  status: AppraisalDisputeStatus;

  // Matches service: hrDecisionNotes (set during resolveDispute)
  @Prop({ type: String })
  hrDecisionNotes?: string;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export const AppraisalDisputeSchema =
  SchemaFactory.createForClass(AppraisalDispute);
