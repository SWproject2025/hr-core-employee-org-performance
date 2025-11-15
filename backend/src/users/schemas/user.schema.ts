// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false }) // Hide password on query
  password: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.EMPLOYEE] })
  roles: UserRole[]; // US-E7-05

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  profile: Types.ObjectId; // 1-to-1 link to the profile

  // Hash password before saving
  @Prop({ type: Function, default: function(password) { return bcrypt.hashSync(password, 10); } })
  preSave: (password: string) => string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hook to hash password
UserSchema.pre<User>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});