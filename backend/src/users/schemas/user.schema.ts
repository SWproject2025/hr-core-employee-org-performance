// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    lowercase: true, // <-- IMPROVEMENT
    index: true,       // <-- IMPROVEMENT
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.EMPLOYEE] })
  roles: UserRole[];

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  profile: Types.ObjectId; 
}
// ... (password hashing logic remains the same) ...
export const UserSchema = SchemaFactory.createForClass(User);