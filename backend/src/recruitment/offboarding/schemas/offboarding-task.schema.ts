import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OffboardingTask extends Document {
  @Prop({ required: true })
  caseId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'in-progress' | 'done';

  @Prop({ default: 'HR' })
  responsibleTeam: string; // HR, IT, Payroll, Facilities, etc.
}

export const OffboardingTaskSchema = SchemaFactory.createForClass(OffboardingTask);
