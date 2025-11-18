// src/organization-structure/schemas/position.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Position extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ unique: true })
  positionId: string; // BR 5 / BR 10

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department: Types.ObjectId; // BR 10

  @Prop({ type: Types.ObjectId, ref: 'Position', default: null })
  reportsTo: Types.ObjectId; // The manager's position

  @Prop()
  payGrade: string; // BR 10

  @Prop({
    type: String,
    enum: ['Active', 'Frozen', 'Delimited'], // BR 16
    default: 'Active',
  })
  status: string;
}
export const PositionSchema = SchemaFactory.createForClass(Position);