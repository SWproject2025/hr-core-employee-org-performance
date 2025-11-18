import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OnboardingTask extends Document {
  @Prop({ required: true })
  caseId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'in-progress' | 'done';

  @Prop({ default: 'HR' })
  responsibleTeam: string; // HR, IT, Admin, Finance, etc.
}

export const OnboardingTaskSchema = SchemaFactory.createForClass(OnboardingTask);
