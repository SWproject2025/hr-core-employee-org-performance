// src/organization-structure/schemas/department.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Department extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ unique: true })
  departmentId: string; // BR 5

  @Prop()
  costCenter: string; // BR 30
}
export const DepartmentSchema = SchemaFactory.createForClass(Department);