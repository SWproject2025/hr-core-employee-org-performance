import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Job extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  departmentId: string; // from Org Structure

  @Prop({ required: true })
  positionId: string; // from Org Structure

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ default: 'open' })
  status: 'open' | 'on-hold' | 'closed';
}

export const JobSchema = SchemaFactory.createForClass(Job);
