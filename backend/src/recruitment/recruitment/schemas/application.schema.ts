import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Application extends Document {
  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true })
  candidateId: string;

  @Prop({ default: Date.now })
  appliedAt: Date;

  @Prop({ default: 'under-review' })
  status:
    | 'under-review'
    | 'shortlisted'
    | 'rejected'
    | 'offer-sent'
    | 'accepted';
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
