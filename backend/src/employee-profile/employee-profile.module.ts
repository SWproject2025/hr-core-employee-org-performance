import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeProfile, EmployeeProfileSchema } from './schemas/employee-profile.schema';
import { CorrectionRequest, CorrectionRequestSchema } from './schemas/correction-request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Position, PositionSchema } from '../organization-structure/schemas/position.schema';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfileController } from './employee-profile.controller';
import { UsersModule } from '../users/users.module';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: CorrectionRequest.name, schema: CorrectionRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
    forwardRef(() => OrganizationStructureModule),
    UsersModule,
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  exports: [EmployeeProfileService, MongooseModule],
})
export class EmployeeProfileModule {}

