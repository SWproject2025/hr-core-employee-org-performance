import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OffboardingCase extends Document {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  exitType: 'resignation' | 'termination';

  @Prop({ default: 'pending' })
  status: 'pending' | 'in-progress' | 'completed';

  @Prop({ default: false })
  payrollClosed: boolean;

  @Prop({ default: false })
  clearanceCompleted: boolean;
}

export const OffboardingCaseSchema = SchemaFactory.createForClass(OffboardingCase);
