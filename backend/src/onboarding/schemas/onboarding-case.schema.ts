import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OnboardingCase extends Document {
  @Prop({ required: true })
  candidateId: string;

  @Prop()
  employeeId: string; // will be filled after creation in Employee Profile

  @Prop({ default: 'pending' })
  status: 'pending' | 'in-progress' | 'completed';

  @Prop({ default: Date.now })
  startDate: Date;
}

export const OnboardingCaseSchema = SchemaFactory.createForClass(OnboardingCase);
