import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Candidate extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  cvUrl: string;

  @Prop({ default: 'new' })
  status:
    | 'new'
    | 'screening'
    | 'interview'
    | 'offered'
    | 'rejected'
    | 'hired';
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
